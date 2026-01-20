/**
 * SSE 请求配置项类型
 * @template TData - 请求体数据的类型（默认任意对象）
 */
interface SSEConfig<TData = Record<string, unknown>> {
  /** 接口地址 */
  url: string
  /** 请求方法（仅支持 GET/POST，SSE 常用） */
  method?: 'GET' | 'POST'
  /** 请求头 */
  headers?: Record<string, string>
  /** POST 请求体数据（GET 时忽略） */
  data?: TData
  /** 流式结束标识（接口返回的结束标记，如 [DONE]/done） */
  endMarker?: string
}

/**
 * SSE 回调函数类型
 * @template TContent - 流式返回内容的类型（默认 string | object）
 */
interface SSECallbacks<TContent = string | Record<string, unknown>> {
  /** 接收实时消息的回调（核心） */
  onMessage: (content: TContent) => void
  /** 流式请求完成的回调（可选） */
  onComplete?: () => void
  /** 错误回调（可选） */
  onError?: (error: Error) => void
}

/**
 * 通用的 fetch SSE (text/event-stream) 流式请求封装（TS 版）
 * @template TData - 请求体数据类型
 * @template TContent - 流式返回内容类型
 * @param config - SSE 请求配置
 * @param callbacks - 回调函数
 * @returns 取消请求的函数（主动终止流式连接）
 */
function fetchSSE<TData = Record<string, unknown>, TContent = string | Record<string, unknown>>(
  config: SSEConfig<TData>,
  callbacks: SSECallbacks<TContent>,
): () => void {
  // 解构配置并设置默认值
  const { url, method = 'POST', headers = {}, data = {} as TData, endMarker = '[DONE]' } = config

  const { onMessage, onComplete, onError } = callbacks

  // 内部状态管理（TS 类型标注）
  let streamBuffer: string = '' // 缓存未解析的流式片段
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null // 流读取器
  let isCanceled: boolean = false // 是否主动取消

  /** 错误处理封装 */
  const handleError = (error: Error): void => {
    if (typeof onError === 'function' && !isCanceled) {
      onError(error)
    } else if (!isCanceled) {
      console.error('SSE 请求错误：', error)
    }
    cleanup() // 出错后清理资源
  }

  /** 资源清理函数（关闭流、重置状态） */
  const cleanup = (): void => {
    if (reader) {
      reader.cancel('资源清理，关闭流')
    }
    reader = null
    streamBuffer = ''
    isCanceled = true
  }

  /** SSE 片段解析核心逻辑 */
  const parseSSEChunk = (chunk: string): void => {
    if (isCanceled) return

    streamBuffer += chunk
    const lines = streamBuffer.split('\n')
    streamBuffer = lines.pop() || '' // 最后一行可能不完整，缓存

    lines.forEach(line => {
      const trimmedLine = line.trim()
      // 过滤空行、注释行（SSE 注释以 : 开头）
      if (!trimmedLine || trimmedLine.startsWith(':')) return

      // 提取 data: 后的实际内容
      if (trimmedLine.startsWith('data:')) {
        const contentStr = trimmedLine.slice(5).trim()

        // 处理结束标识
        if (contentStr === endMarker) {
          typeof onComplete === 'function' && onComplete()
          cleanup()
          return
        }

        // 解析内容（支持 JSON/纯文本），触发回调
        try {
          // 尝试解析为 JSON（匹配 TContent 为对象的场景）
          const parsedContent = JSON.parse(contentStr) as TContent
          onMessage(parsedContent)
        } catch (e) {
          // 解析失败则作为纯文本返回（匹配 TContent 为 string 的场景）
          onMessage(contentStr as TContent)
        }
      }
    })
  }

  /** 核心请求逻辑 */
  const initRequest = async (): Promise<void> => {
    try {
      // 构造 fetch 请求参数（TS 类型标注）
      const fetchOptions: RequestInit = {
        method,
        headers: {
          Accept: 'text/event-stream', // 强制接收 SSE 格式
          'Content-Type': 'application/json', // 默认 JSON 格式
          ...headers, // 合并用户自定义请求头（优先级更高）
        },
      }

      // POST 请求拼接 body
      if (method.toUpperCase() === 'POST') {
        fetchOptions.body = JSON.stringify(data)
      }

      // 发起请求
      const response = await fetch(url, fetchOptions)

      // 检查 HTTP 状态
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`)
      }

      // 检查是否支持流式响应
      if (!response.body) {
        throw new Error('接口不支持流式传输（response.body 为空）')
      }

      // 创建读取器和解码器
      const decoder = new TextDecoder('utf-8')
      reader = response.body.getReader()

      // 循环读取流式数据
      while (!isCanceled) {
        const { done, value } = await reader.read()

        // 流正常结束
        if (done) {
          // 处理最后剩余的缓存内容
          if (streamBuffer) {
            parseSSEChunk(streamBuffer)
          }
          if (typeof onComplete === 'function' && !isCanceled) {
            onComplete()
          }
          cleanup()
          break
        }

        // 解码二进制数据并解析
        const chunkText = decoder.decode(value, { stream: true })
        parseSSEChunk(chunkText)
      }
    } catch (error) {
      // 主动取消不触发错误回调，且仅处理 Error 类型的错误
      if (!isCanceled && error instanceof Error) {
        handleError(error)
      }
    }
  }

  // 初始化请求
  initRequest()

  // 返回取消函数，供外部主动终止请求
  return (): void => {
    isCanceled = true
    cleanup()
  }
}

// 导出类型和函数（方便项目中导入使用）
export type { SSEConfig, SSECallbacks }
export default fetchSSE
