import { ImageResponse } from 'next/og';

export const alt = 'Lawrence Musyoka — Software engineer and founder of Talosys. Projects, notebook, and experiments.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#111522', color: '#f5f5f7', padding: '56px 64px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#adb3c4' }}><span>SOFTWARE ENGINEERING / INDEPENDENT PRACTICE</span><span>NAIROBI, KENYA</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 110, letterSpacing: '-5px', lineHeight: 1.02 }}><span>Lawrence</span><span style={{ color: '#b7c7ff' }}>Musyoka.</span></div>
      <div style={{ display: 'flex', borderTop: '1px solid #333a4d', paddingTop: 26, justifyContent: 'space-between', fontSize: 21 }}><span style={{ color: '#ffb29e' }}>Software engineer · Founder, Talosys</span><span style={{ color: '#adb3c4' }}>WORK / NOTEBOOK / LAB</span></div>
    </div>,
    size,
  );
}
