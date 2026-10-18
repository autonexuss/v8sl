# Simulator audio credits

The Environment driving simulator uses these CC0 1.0 Universal recordings from Freesound. They are illustrative recordings of diesel cars; the original source pages do not establish that they were captured from a 1.5 L engine.

- `diesel-start-stop.mp3` — “old car engine start and stop”, by launemax: https://freesound.org/people/launemax/sounds/250009/
- `diesel-idle-throttle.mp3` — “Diesel engine idle and gas”, by Iridiuss: https://freesound.org/people/Iridiuss/sounds/399773/. The simulator uses two short, loopable WAV crops derived from this CC0 recording:
  - `diesel-idle-loop.wav` — steady idle excerpt, loop-smoothed at the boundary.
  - `diesel-rev-loop.wav` — matching acceleration/rev excerpt, loop-smoothed at the boundary.
- `diesel-stop.mp3` — “SFX_Car_Engine_Outside_Stop.wav”, by GiocoSound: https://freesound.org/people/GiocoSound/sounds/401557/

The simulator plays the idle excerpt at a fixed rate after startup. While the accelerator is pressed, it layers the separate rev excerpt; rev-layer volume and playback rate follow simulated throttle and RPM. Releasing the accelerator returns the mix to idle. These are generic CC0 diesel recordings, not a Fortuner recording or a physical engine synthesizer. Toyota figures shown in the simulator are limited to the published peak power and torque; idle, ratios, RPM response and all audio behavior are estimates.
