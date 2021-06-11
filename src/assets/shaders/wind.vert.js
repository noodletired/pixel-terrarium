export default /* glsl */ `
// Builtins
// See http://pixijs.download/dev/docs/PIXI.Filter.html
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

uniform vec4 inputPixel;  // xy = size of framebuffer in real pixels, zw = inverse
uniform vec4 outputFrame; // zw = size of framebuffer in CSS

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

// Customs
uniform highp float time;
// TODO: add attribute or for interaction velocity
uniform vec2 velocity; // e.g. from user input

varying vec2 vUV;

// Entry
void main(void)
{
	// Setup
	vec2 screenPosition = aVertexPosition + outputFrame.xy;
	vec2 screenSize = outputFrame.zw;
	vec2 normalizedScreenPosition = screenPosition / screenSize;
	vec2 UV = aTextureCoord * inputPixel.xy / outputFrame.zw;
	float scaledTime = time * 0.1;
	float height = 1.0 - UV.y;

	// Define the wind
	vec2 wind = vec2(
		cos(normalizedScreenPosition.x + scaledTime),
		sin(normalizedScreenPosition.y + scaledTime)
	) * height * velocity * screenSize;

	// Shift vertex position
	vec2 shiftedVertexPosition = aVertexPosition + wind;

	// Outputs
	gl_Position = vec4((projectionMatrix * vec3(shiftedVertexPosition, 1.0)).xy, 0.0, 1.0);
	vFilterCoord = (filterMatrix * vec3(aTextureCoord, 1.0)).xy;
	vTextureCoord = aTextureCoord;
	vUV = UV;
}
`;