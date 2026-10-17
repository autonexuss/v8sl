(() => {
  const overlay = document.getElementById('squirtle-easter-egg');
  const canvas = document.getElementById('squirtle-easter-egg-canvas');
  const video = document.getElementById('squirtle-easter-egg-video');
  if (!overlay || !canvas || !video) return;

  let active = false;
  let frameHandle = 0;
  let gl = null;
  let context2d = null;
  let program = null;
  let texture = null;
  let uniforms = null;
  let renderer = 'none';
  let swallowNextClick = false;

  const vertexSource = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform sampler2D u_video;
    uniform vec2 u_resolution;
    uniform vec2 u_video_resolution;
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float canvasAspect = u_resolution.x / u_resolution.y;
      float videoAspect = u_video_resolution.x / u_video_resolution.y;
      if (canvasAspect > videoAspect) {
        float fittedWidth = videoAspect / canvasAspect;
        uv.x = (uv.x - 0.5) / fittedWidth + 0.5;
        if (uv.x < 0.0 || uv.x > 1.0) { gl_FragColor = vec4(0.0); return; }
      } else {
        float fittedHeight = canvasAspect / videoAspect;
        uv.y = (uv.y - 0.5) / fittedHeight + 0.5;
        if (uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
      }
      vec4 pixel = texture2D(u_video, uv);
      float greenDominance = pixel.g - max(pixel.r, pixel.b);
      float keyed = smoothstep(0.09, 0.27, greenDominance);
      float alpha = 1.0 - keyed;
      float spill = max(0.0, greenDominance - 0.025) * 0.42 * alpha;
      pixel.g = max(0.0, pixel.g - spill);
      gl_FragColor = vec4(pixel.rgb, alpha);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Squirtle video shader could not compile:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function setupWebGL() {
    gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return false;
    const vertex = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return false;
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Squirtle video shader could not link:', gl.getProgramInfoLog(program));
      return false;
    }

    const position = gl.getAttribLocation(program, 'a_position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);
    uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      videoResolution: gl.getUniformLocation(program, 'u_video_resolution'),
      video: gl.getUniformLocation(program, 'u_video')
    };
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    renderer = 'webgl';
    return true;
  }

  function resizeCanvas() {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5, 1440 / window.innerWidth, 1000 / window.innerHeight);
    const width = Math.max(1, Math.round(window.innerWidth * scale));
    const height = Math.max(1, Math.round(window.innerHeight * scale));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    if (gl) gl.viewport(0, 0, width, height);
  }

  function drawWebGL() {
    if (!gl || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return;
    gl.useProgram(program);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    } catch { return; }
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.videoResolution, video.videoWidth, video.videoHeight);
    gl.uniform1i(uniforms.video, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function drawCanvasFallback() {
    if (!context2d || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return;
    const width = canvas.width;
    const height = canvas.height;
    context2d.clearRect(0, 0, width, height);
    const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
    const drawWidth = video.videoWidth * scale;
    const drawHeight = video.videoHeight * scale;
    context2d.drawImage(video, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    const image = context2d.getImageData(0, 0, width, height);
    const pixels = image.data;
    for (let index = 0; index < pixels.length; index += 4) {
      const greenDominance = pixels[index + 1] - Math.max(pixels[index], pixels[index + 2]);
      const value = Math.max(0, Math.min(1, (greenDominance - 0.09) / 0.18));
      const keyed = value * value * (3 - 2 * value);
      const alpha = 1 - keyed;
      pixels[index + 1] = Math.max(0, pixels[index + 1] - Math.max(0, greenDominance - 0.025) * 0.42 * alpha);
      pixels[index + 3] = Math.round(alpha * 255);
    }
    context2d.putImageData(image, 0, 0);
  }

  function renderFrame() {
    if (!active) return;
    if (renderer === 'webgl') drawWebGL();
    else if (renderer === '2d') drawCanvasFallback();
    if (!video.ended) frameHandle = window.requestAnimationFrame(renderFrame);
  }

  function dismissOnPointer(event) {
    if (!active) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (event.type === 'pointerdown') {
      swallowNextClick = true;
      window.setTimeout(() => { swallowNextClick = false; }, 700);
    }
    stopDance();
  }

  function dismissOnClick(event) {
    if (active) {
      dismissOnPointer(event);
      return;
    }
    if (!swallowNextClick) return;
    swallowNextClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  function dismissOnKey(event) {
    if (active && event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      stopDance();
    }
  }

  function stopDance() {
    if (!active) return;
    active = false;
    window.cancelAnimationFrame(frameHandle);
    video.pause();
    try { video.currentTime = 0; } catch { /* A stream may not be seekable yet. */ }
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    if (gl) {
      gl.clear(gl.COLOR_BUFFER_BIT);
    } else if (context2d) {
      context2d.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function startDance() {
    if (active) stopDance();
    window.dispatchEvent(new CustomEvent('autonexus:close-feature-panel'));
    document.querySelector('.brand')?.focus({ preventScroll: true });
    resizeCanvas();
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    active = true;
    try { video.currentTime = 0; } catch { /* Playback will start at its first available frame. */ }
    renderFrame();
    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') playRequest.catch(stopDance);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  document.addEventListener('pointerdown', dismissOnPointer, true);
  document.addEventListener('click', dismissOnClick, true);
  document.addEventListener('keydown', dismissOnKey, true);
  video.addEventListener('ended', stopDance);
  video.addEventListener('error', stopDance);
  window.addEventListener('autonexus:squirtle-easter-egg', startDance);

  if (setupWebGL()) {
    resizeCanvas();
  } else if (!gl) {
    context2d = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    if (context2d) {
      renderer = '2d';
      resizeCanvas();
    }
  }
})();
