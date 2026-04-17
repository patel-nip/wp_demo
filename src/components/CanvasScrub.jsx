import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const padIndex = (idx) => idx.toString().padStart(4, '0');

function renderCover(img, ctx, canvas) {
  if (!img) return;
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShift_x = (canvas.width - img.width * ratio) / 2;
  const centerShift_y = (canvas.height - img.height * ratio) / 2;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    img,
    0, 0, img.width, img.height,
    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
  );
}

export default function CanvasScrub({ sectionId, frameCount, folderPath, scrubDistance = '200%', children }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const sectionRef = useRef(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sectionRef.current) return;
    
    const ctx = canvas.getContext('2d');
    
    const playhead = { frame: 0 };

    // Set actual responsive bounds
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (imagesRef.current.length > 0) {
         renderCover(imagesRef.current[playhead.frame], ctx, canvas);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Preload
    const images = [];
    imagesRef.current = images;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `${folderPath}/${padIndex(i)}.jpg`;
      images.push(img);
    }

    images[0].onload = () => {
      renderCover(images[0], ctx, canvas);
    };
    // playhead is declared above
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: `+=${scrubDistance}`,
      pin: true,
      scrub: 1, // Smooth interpolation
      animation: gsap.to(playhead, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        onUpdate: () => {
          if (images[playhead.frame]) {
             renderCover(images[playhead.frame], ctx, canvas);
          }
        }
      })
    });

    return () => {
       window.removeEventListener('resize', resizeCanvas);
    };
  }, { scope: sectionRef, dependencies: [frameCount, folderPath, scrubDistance] });

  return (
    <section className="scroll-section" id={sectionId} ref={sectionRef}>
      <div className="canvas-container">
        <canvas ref={canvasRef}></canvas>
      </div>
      {children}
    </section>
  );
}
