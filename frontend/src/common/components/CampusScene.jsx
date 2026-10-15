import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import './CampusScene.css';

function Solid({ className = '', front, right, top, children }) {
  return <div className={`scene-solid ${className}`}>
    <div className="solid-face solid-front">{front}</div>
    <div className="solid-face solid-back" />
    <div className="solid-face solid-right">{right}</div>
    <div className="solid-face solid-left" />
    <div className="solid-face solid-top">{top}</div>
    <div className="solid-face solid-bottom" />
    {children}
  </div>;
}

const windows = <div className="building-windows">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>;

export default function CampusScene() {
  const [paused, setPaused] = useState(false);
  const scene = useRef(null);

  useEffect(() => {
    const element = scene.current;
    let visible = true;
    const update = () => { element.dataset.visible = String(visible && !document.hidden); };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer?.observe(element);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return <figure ref={scene} className={`campus-diorama${paused ? ' scene-paused' : ''}`}>
    <div className="scene-label"><span /> A better way to campus</div>
    <div className="scene-viewport" role="img" aria-label="Animated three-dimensional blue campus bus beside university buildings on a raised road platform">
      <div className="scene-halo" aria-hidden="true" />
      <div className="scene-scale" aria-hidden="true">
        <div className="scene-world">
          <Solid className="scene-ground" top={<><div className="scene-road" /><div className="scene-path" /></>} />
          <Solid className="scene-building scene-building-main" front={<><span className="building-title">CAMPUS</span>{windows}<div className="building-door" /></>} right={windows} />
          <Solid className="scene-building scene-building-wing" front={windows} right={windows} />
          <Solid className="scene-roof" />
          <div className="scene-tree scene-tree-one"><div /><i /></div>
          <div className="scene-tree scene-tree-two"><div /><i /></div>
          <div className="scene-bus-motion">
            <Solid className="scene-bus" front={<><div className="bus-windows">{[0, 1, 2, 3, 4].map(i => <i key={i} />)}</div><span className="bus-lettering">CAMPUS BUS</span><span className="bus-door" /></>} right={<><span className="bus-destination">CAMPUS</span><span className="bus-windshield" /><span className="bus-headlights" /></>} top={<span className="bus-roof-vent" />}>
              {['near', 'far'].flatMap(side => ['front', 'back'].map(position => <div key={`${side}-${position}`} className={`bus-wheel wheel-${side} wheel-${position}`}><i /></div>))}
            </Solid>
          </div>
          <div className="scene-stop"><span><Icon name="bus" size={18} /></span></div>
        </div>
      </div>
      <div className="scene-tag scene-tag-pass" aria-hidden="true"><span className="scene-tag-icon"><Icon name="id-card" size={22} /></span><div><small>YOUR NEXT STOP</small><strong>A simpler commute.</strong></div></div>
      <div className="scene-tag scene-tag-route" aria-hidden="true"><Icon name="route" size={20} /><span>Home <span className="tag-route-line" /> Campus</span></div>
    </div>
    <figcaption className="scene-caption"><span><Icon name="shield" size={15} /> One campus. Better connected.</span><button type="button" className="scene-motion-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Play animation' : 'Pause animation'}<span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span></button></figcaption>
  </figure>;
}
