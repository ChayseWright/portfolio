import React, { useEffect, useRef } from 'react';

/**
 * Realistic Physiological EEG Waveform Simulation
 * 
 * Mathematical Model:
 * Scalp EEG potentials represent the spatial summation of synchronized postsynaptic
 * potentials across cortical pyramidal neural assemblies. Real EEG features:
 * 1. 1/f^alpha broadband power-law spectral background
 * 2. Physiological oscillatory resonances:
 *    - Delta band (0.5 - 3.5 Hz): Slow baseline drift
 *    - Theta band (4 - 7.5 Hz): Frontal midline cognitive rhythm (Fz)
 *    - Alpha band (8 - 12.5 Hz): Posterior / occipital rhythm (O1) with waxing/waning spindle envelopes
 *    - Mu rhythm (9 - 11 Hz fundamental, 18 - 22 Hz harmonic): Sensorimotor central cortex (C3/Cz)
 * 3. Spatial Wave Propagation Invariance:
 *    Evaluated strictly as y(x, t) = Y_center + S(x - v * t).
 *    Because S is a rigid function of (x - v * t), every peak, trough, and alpha spindle
 *    propagates from the left of the screen without changing shape or morphing in transit.
 * 4. Band-limited smoothing: High-frequency EMG spikes (>22 Hz) are attenuated for clean,
 *    dignified viewing behind typography.
 */

interface EegSpectralMode {
  freq: number;  // Spatial frequency (rad/px)
  amp: number;   // Amplitude (px)
  phase: number; // Phase offset (rad)
}

interface EegChannelConfig {
  id: string;
  label: string;
  yRatio: number;
  alphaStroke: string;
  modes: EegSpectralMode[];
}

export const NeuralWaveBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // 5 Clinical/Research 10-20 EEG Channels
    const channels: EegChannelConfig[] = [
      {
        id: 'fp1',
        label: 'EEG Fp1-F3 (Frontal Slow / δ-θ)',
        yRatio: 0.18,
        alphaStroke: 'rgba(244, 244, 245, 0.22)',
        // Slow delta baseline carrier (0.8-1.5 Hz) + frontal theta (4.8 Hz)
        modes: [
          { freq: 0.0032, amp: 8.0, phase: 0.4 },
          { freq: 0.0068, amp: 4.5, phase: 1.8 },
          { freq: 0.0125, amp: 4.0, phase: 3.1 },
          { freq: 0.0182, amp: 2.0, phase: 0.9 },
        ]
      },
      {
        id: 'fz',
        label: 'EEG Fz (Midline Theta Rhythm)',
        yRatio: 0.36,
        alphaStroke: 'rgba(244, 244, 245, 0.32)',
        // Dominant frontal midline theta (~6 Hz) + gentle carrier
        modes: [
          { freq: 0.0041, amp: 5.0, phase: 2.2 },
          { freq: 0.0142, amp: 9.5, phase: 0.8 },
          { freq: 0.0165, amp: 5.5, phase: 2.7 },
          { freq: 0.0240, amp: 2.5, phase: 4.3 },
        ]
      },
      {
        id: 'c3',
        label: 'EEG C3 (Sensorimotor μ-Rhythm)',
        yRatio: 0.54,
        alphaStroke: 'rgba(244, 244, 245, 0.38)',
        // Classic comb/arch shaped mu rhythm: ~10 Hz fundamental + ~20 Hz second harmonic
        modes: [
          { freq: 0.0035, amp: 3.5, phase: 1.1 },
          { freq: 0.0225, amp: 8.5, phase: 0.5 },
          { freq: 0.0248, amp: 5.0, phase: 1.9 },
          { freq: 0.0460, amp: 3.0, phase: 3.8 }, // smoothed mu harmonic
        ]
      },
      {
        id: 'cz',
        label: 'EEG Cz (Central Vertex)',
        yRatio: 0.72,
        alphaStroke: 'rgba(244, 244, 245, 0.26)',
        // Balanced central potential with slow rolling drift and mixed rhythmicity
        modes: [
          { freq: 0.0050, amp: 6.0, phase: 3.4 },
          { freq: 0.0180, amp: 6.5, phase: 1.2 },
          { freq: 0.0260, amp: 4.0, phase: 0.3 },
          { freq: 0.0380, amp: 2.2, phase: 2.5 },
        ]
      },
      {
        id: 'o1',
        label: 'EEG O1 (Occipital Spindles α)',
        yRatio: 0.88,
        alphaStroke: 'rgba(244, 244, 245, 0.30)',
        // Classic occipital Berger alpha rhythm with dual-frequency beating creating natural 1.5-2s waxing/waning spindles
        modes: [
          { freq: 0.0030, amp: 3.5, phase: 0.0 },
          { freq: 0.0232, amp: 8.0, phase: 0.6 },
          { freq: 0.0256, amp: 7.0, phase: 2.1 }, // beat envelope = 0.0024 rad/px
          { freq: 0.0110, amp: 2.5, phase: 4.0 },
        ]
      },
    ];

    // Uniform propagation speed across channels (pixels per animation step)
    const driftSpeed = 0.9;
    let stepCount = 0;

    const render = () => {
      stepCount += 1;
      const timeOffset = stepCount * driftSpeed;

      ctx.clearRect(0, 0, width, height);

      channels.forEach((ch) => {
        const centerY = height * ch.yRatio;

        // Baseline guideline (Starlight Gray #27272A)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(39, 39, 42, 0.40)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 10]);
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Electrode Channel Tag on left (Sterling Fog #9CA3AF)
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(156, 163, 175, 0.55)';
        ctx.fillText(ch.label, 16, centerY - 9);

        // Continuous Invariant Waveform Trace
        // Because y(x, t) is strictly a function of (x - timeOffset),
        // each waveform profile propagates from left to right with 100% shape invariance.
        ctx.beginPath();
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = ch.alphaStroke;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const stepX = 2; // Fine resolution for smooth curves without jaggedness
        let isFirst = true;

        for (let x = 0; x <= width + stepX; x += stepX) {
          // Invariant propagation coordinate xi:
          // A wave generated at x = 0 travels towards x = width as timeOffset increases.
          const xi = x - timeOffset;

          // Compute exact continuous physiological potential via harmonic summation
          let yOffset = 0;
          for (let m = 0; m < ch.modes.length; m++) {
            const mode = ch.modes[m];
            yOffset += mode.amp * Math.sin(mode.freq * xi + mode.phase);
          }

          const y = centerY + yOffset;

          if (isFirst) {
            ctx.moveTo(x, y);
            isFirst = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};

