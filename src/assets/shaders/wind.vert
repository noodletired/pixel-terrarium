// Builtins
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

// Custom uniforms
uniform float time;
uniform vec2 velocity;
uniform sampler2D noiseTexture;

void main(void)
{
	// Get some noise
	vec2 noiseCoord = (aVertexPosition + vec2(cos(time), sin(time))).normalise();
	vec3 noiseColor = texture2D(noiseTexture, noiseCoord);

	// Shift vertex position
	float height = aTextureCoord.y;
	vec2 shiftedVertexPosition = aVertexPosition + noiseColor.xy * height;

	gl_Position = vec4((projectionMatrix * vec3(shiftedVertexPosition, 1.0)).xy, 0.0, 1.0);
	vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0) ).xy;
	vTextureCoord = aTextureCoord;
}