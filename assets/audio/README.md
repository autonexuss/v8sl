# Simulator audio credits

The Environment driving simulator uses these CC0 1.0 Universal recordings from Freesound. They are illustrative recordings of diesel cars; the original source pages do not establish that they were captured from a 1.5 L engine.

- `diesel-start-stop.mp3` — “old car engine start and stop”, by launemax: https://freesound.org/people/launemax/sounds/250009/
- `diesel-idle-throttle.mp3` — “Diesel engine idle and gas”, by Iridiuss: https://freesound.org/people/Iridiuss/sounds/399773/. The simulator uses two short, loopable WAV crops derived from this CC0 recording:
  - `diesel-idle-loop.wav` — steady idle excerpt, loop-smoothed at the boundary.
  - `diesel-rev-loop.wav` — matching acceleration/rev excerpt, loop-smoothed at the boundary.
- `diesel-stop.mp3` — “SFX_Car_Engine_Outside_Stop.wav”, by GiocoSound: https://freesound.org/people/GiocoSound/sounds/401557/

The simulator holds the idle excerpt at a fixed playback rate, then layers in the rev excerpt only while the accelerator is pressed. Its volume and a small pitch range follow the simulated throttle and RPM. It is illustrative, not a physical engine sound synthesizer or a vehicle-specific recording.
