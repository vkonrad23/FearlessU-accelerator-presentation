import type { Camera, Object3D, Scene, WebGLRenderer } from 'three';

/** Wait on live GPU programs, not materials that React may replace during a resize. */
export function prepareShaders(
  renderer: WebGLRenderer,
  object: Object3D,
  camera: Camera,
  signal: AbortSignal,
  targetScene?: Scene,
  timeoutMs = 12_000,
) {
  return new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (error?: unknown) => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      if (error) reject(error);
      else resolve();
    };
    const cancel = () => finish();
    if (signal.aborted) { resolve(); return; }
    signal.addEventListener('abort', cancel, { once: true });
    try {
      const context = renderer.getContext();
      const parallel = context.getExtension('KHR_parallel_shader_compile');
      const deadline = performance.now() + timeoutMs;
      renderer.compile(object, camera, targetScene);
      const check = () => {
        if (signal.aborted) { finish(); return; }
        try {
          if (context.isContextLost()) throw new Error('WebGL context lost during shader preparation.');
          const pending = parallel && renderer.info.programs?.some(({ program }) =>
            program && context.isProgram(program) && !context.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR));
          if (!pending) { finish(); return; }
          if (performance.now() >= deadline) throw new Error('Shader preparation timed out.');
          timer = setTimeout(check, 16);
        } catch (error) { finish(error); }
      };
      // Yield even without the parallel extension, as Three's async compiler does.
      timer = setTimeout(check, 0);
    } catch (error) { finish(error); }
  });
}
