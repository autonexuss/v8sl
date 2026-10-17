(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loader = document.getElementById('model-viewer-runtime');
  const openedAsFile = window.location.protocol === 'file:';
  const earthViewer = document.querySelector('.ev-earth-model');
  const earthStage = document.querySelector('.ev-map-earth');
  const earthFallback = earthStage?.querySelector('.ev-earth-fallback');

  if (openedAsFile) {
    document.body.classList.add('model-viewer-unavailable');
    document.querySelectorAll('.showroom-model-fallback').forEach(fallback => {
      fallback.textContent = '3D needs the local server · run Start Autonexus.cmd';
    });
  }

  loader?.addEventListener('error', () => {
    document.body.classList.add('model-viewer-unavailable');
    if (!openedAsFile) {
      document.querySelectorAll('.showroom-model-fallback').forEach(fallback => {
        fallback.textContent = '3D preview unavailable · open feature';
      });
    }
    if (earthStage) {
      earthStage.classList.add('is-earth-error');
      if (earthFallback) earthFallback.textContent = openedAsFile
        ? 'Run Start Autonexus.cmd to view the 3D Earth.'
        : 'The Earth preview could not load. The charging search is still available.';
    }
  }, { once: true });

  if (earthViewer && earthStage) {
    earthViewer.addEventListener('load', () => {
      earthStage.classList.add('is-earth-ready');
      void addEarthPins(earthViewer);
    }, { once: true });
    earthViewer.addEventListener('error', () => {
      earthStage.classList.add('is-earth-error');
      if (earthFallback) earthFallback.textContent = 'The Earth preview could not load. The charging search is still available.';
    }, { once: true });
    if (openedAsFile && earthFallback) earthFallback.textContent = 'Run Start Autonexus.cmd to view the 3D Earth.';

    earthViewer.removeAttribute('auto-rotate');
  }

  async function addEarthPins(viewer) {
    if (viewer.dataset.pinsReady === 'true' || window.location.protocol === 'file:') return;
    viewer.dataset.pinsReady = 'loading';
    const places = [
      [35.37,-119.02,'fuel'],[36.17,-115.14,'parking'],[39.74,-104.99,'service'],[41.88,-87.63,'rest'],[19.43,-99.13,'charging'],[43.65,-79.38,'fuel'],[45.50,-73.57,'parking'],
      [-23.55,-46.63,'service'],[-15.79,-47.88,'rest'],[-34.60,-58.38,'charging'],[-12.05,-77.04,'fuel'],
      [51.50,-0.12,'parking'],[48.86,2.35,'service'],[52.52,13.40,'rest'],[40.42,-3.70,'charging'],[41.90,12.50,'fuel'],[59.33,18.06,'parking'],[55.75,37.62,'service'],
      [6.52,3.38,'rest'],[-26.20,28.04,'charging'],[30.04,31.23,'fuel'],[9.03,38.74,'parking'],
      [28.61,77.21,'service'],[19.08,72.88,'rest'],[12.97,77.59,'charging'],[39.90,116.40,'fuel'],[31.23,121.47,'parking'],[35.68,139.69,'service'],[37.56,126.98,'rest'],[13.75,100.50,'charging'],[24.71,46.67,'fuel'],[41.01,28.97,'parking'],[-33.87,151.21,'service'],[-37.81,144.96,'rest']
    ];
    const symbols = { charging: 'ϟ', fuel: 'F', parking: 'P', service: 'W', rest: 'S' };
    try {
      const response = await fetch(viewer.currentSrc || viewer.src);
      if (!response.ok) throw new Error('Earth model could not be fetched');
      const bytes = await response.arrayBuffer();
      const view = new DataView(bytes);
      if (view.getUint32(0, true) !== 0x46546c67) throw new Error('Unsupported Earth model');
      const jsonLength = view.getUint32(12, true);
      const gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes, 20, jsonLength)));
      const binOffset = 20 + jsonLength + 8;
      const meshNode = gltf.nodes.findIndex(node => Number.isInteger(node.mesh));
      const parents = new Map();
      gltf.nodes.forEach((node, index) => (node.children || []).forEach(child => parents.set(child, index)));
      const chain = [];
      for (let node = meshNode; node !== undefined; node = parents.get(node)) chain.unshift(gltf.nodes[node]);
      const identity = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
      const multiply = (a, b) => {
        const out = new Array(16).fill(0);
        for (let col=0; col<4; col++) for (let row=0; row<4; row++) for (let k=0; k<4; k++) out[col*4+row] += a[k*4+row] * b[col*4+k];
        return out;
      };
      let world = identity();
      chain.forEach(node => { if (node.matrix?.length === 16) world = multiply(world, node.matrix); });
      const primitive = gltf.meshes[gltf.nodes[meshNode].mesh].primitives[0];
      const posAccessor = gltf.accessors[primitive.attributes.POSITION];
      const uvAccessor = gltf.accessors[primitive.attributes.TEXCOORD_0];
      const posView = gltf.bufferViews[posAccessor.bufferView];
      const uvView = gltf.bufferViews[uvAccessor.bufferView];
      const positionStart = binOffset + (posView.byteOffset || 0) + (posAccessor.byteOffset || 0);
      const uvStart = binOffset + (uvView.byteOffset || 0) + (uvAccessor.byteOffset || 0);
      const posStride = posView.byteStride || 12;
      const uvStride = uvView.byteStride || 8;
      const vertexCount = Math.min(posAccessor.count, uvAccessor.count);
      const transform = (x,y,z,w=1) => [
        world[0]*x + world[4]*y + world[8]*z + world[12]*w,
        world[1]*x + world[5]*y + world[9]*z + world[13]*w,
        world[2]*x + world[6]*y + world[10]*z + world[14]*w
      ];
      places.forEach(([lat, lon, kind], index) => {
        const u = (lon + 180) / 360;
        const v = (lat + 90) / 180;
        let nearest = 0, best = Infinity;
        for (let i=0; i<vertexCount; i++) {
          const uv = uvStart + i * uvStride;
          let du = Math.abs(view.getFloat32(uv, true) - u);
          du = Math.min(du, 1 - du);
          const dv = view.getFloat32(uv + 4, true) - v;
          const score = (du * Math.cos(lat * Math.PI / 180)) ** 2 + dv ** 2;
          if (score < best) { best = score; nearest = i; }
        }
        const p = positionStart + nearest * posStride;
        const raw = [view.getFloat32(p,true), view.getFloat32(p+4,true), view.getFloat32(p+8,true)];
        const point = transform(...raw);
        const normal = transform(...raw, 0);
        const length = Math.hypot(...normal) || 1;
        const nx = normal[0]/length, ny = normal[1]/length, nz = normal[2]/length;
        const pin = document.createElement('button');
        pin.type = 'button';
        pin.slot = `hotspot-map-pin-${index}`;
        pin.className = 'earth-map-pin';
        pin.dataset.pinKind = kind;
        pin.setAttribute('data-position', `${(point[0] + nx*1.8).toFixed(3)} ${(point[1] + ny*1.8).toFixed(3)} ${(point[2] + nz*1.8).toFixed(3)}`);
        pin.setAttribute('data-normal', `${nx.toFixed(4)} ${ny.toFixed(4)} ${nz.toFixed(4)}`);
        pin.setAttribute('data-visibility-attribute', 'visible');
        pin.setAttribute('aria-hidden', 'true');
        pin.tabIndex = -1;
        const glyph = document.createElement('span');
        const symbol = document.createElement('b');
        symbol.textContent = symbols[kind];
        glyph.append(symbol);
        pin.append(glyph);
        viewer.append(pin);
      });
      viewer.dataset.pinsReady = 'true';
    } catch (error) {
      delete viewer.dataset.pinsReady;
      console.warn('Earth location markers could not be prepared.', error);
    }
  }

  document.querySelectorAll('.showroom-feature-tile').forEach(tile => {
    const viewer = tile.querySelector('model-viewer');
    if (!viewer) return;

    viewer.addEventListener('load', () => tile.classList.add('is-model-ready'), { once: true });
    viewer.addEventListener('error', () => {
      tile.classList.add('has-model-error');
      const fallback = tile.querySelector('.showroom-model-fallback');
      if (fallback) fallback.textContent = '3D preview unavailable · open feature';
    });

    const turn = enabled => {
      if (reduceMotion.matches || tile.classList.contains('has-model-error')) {
        viewer.removeAttribute('auto-rotate');
        return;
      }
      viewer.toggleAttribute('auto-rotate', enabled);
    };

    tile.addEventListener('pointerenter', () => turn(true));
    tile.addEventListener('pointerleave', () => turn(false));
    tile.addEventListener('focusin', () => turn(true));
    tile.addEventListener('focusout', event => {
      if (!tile.contains(event.relatedTarget)) turn(false);
    });
  });
})();
