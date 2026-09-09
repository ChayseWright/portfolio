import React, { useEffect, useRef } from 'react';

export const NeuralWaveBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Simulated multi-channel EEG / EMG channels
    const channels = [
      { baseFreq: 0.015, amp: 24, speed: 1.2, yRatio: 0.20, color: 'rgba(203, 169, 93, 0.35)', label: 'CH1: EEG-Fz (θ/α)' },
      { baseFreq: 0.022, amp: 32, speed: 1.8, yRatio: 0.38, color: 'rgba(44, 95, 62, 0.65)', label: 'CH2: EEG-Cz (μ-rhythm)' },
      { baseFreq: 0.035, amp: 18, speed: 2.2, yRatio: 0.56, color: 'rgba(203, 169, 93, 0.40)', label: 'CH3: EMG-Flexor (sEMG)' },
      { baseFreq: 0.018, amp: 28, speed: 1.5, yRatio: 0.74, color: 'rgba(44, 95, 62, 0.55)', label: 'CH4: EMG-Extensor' },
      { baseFreq: 0.028, amp: 22, speed: 2.0, yRatio: 0.88, color: 'rgba(221, 198, 164, 0.30)', label: 'CH5: Cortical Intent' },
    ];

    let t = 0;

    const render = () => {
      t += 0.025;
      ctx.clearRect(0, 0, width, height);

      channels.forEach((ch) => {
        const centerY = height * ch.yRatio;

        // Baseline guideline
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(44, 95, 62, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Channel Label on left
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(203, 169, 93, 0.45)';
        ctx.fillText(ch.label, 16, centerY - 8);

        // Neural waveform trace
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = ch.color;

        for (let x = 0; x <= width; x += 3) {
          // Compound wave synthesis (fundamental + harmonics + occasional neural spike bursts)
          const wavePhase = (x * ch.baseFreq) - (t * ch.speed);
          
          // Base sinusoidal components
          let yOffset = Math.sin(wavePhase) * ch.amp * 0.6;
          yOffset += Math.sin(wavePhase * 2.1 + 0.8) * (ch.amp * 0.3);
          yOffset += Math.cos(wavePhase * 0.4 - 1.2) * (ch.amp * 0.25);

          // Simulated BCI motor spike burst (occasional localized high-frequency transients)
          const burstPos = Math.sin((x * 0.003) - (t * 0.4));
          if (burstPos > 0.82) {
            yOffset += (Math.sin(wavePhase * 8.5) * ch.amp * 0.55) * ((burstPos - 0.82) / 0.18);
          }

          const y = centerY + yOffset;

          if (x === 0) {
            ctx.moveTo(x, y);
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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-80 ${className}`}
    />
  );
};
