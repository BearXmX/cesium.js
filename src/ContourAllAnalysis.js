//等高线整体绘制渲染（全部地形）
var contourUniforms = {};
var material = Cesium.Material.fromType("ElevationContour");
contourUniforms = material.uniforms;
contourUniforms.width = 2.0; // 线宽
contourUniforms.spacing = 150.0; // 间距
contourUniforms.color = Cesium.Color.fromRandom(
  { alpha: 1.0 },
  Cesium.Color.RED.clone()
); // 颜色
viewer.scene.globe.material = material;