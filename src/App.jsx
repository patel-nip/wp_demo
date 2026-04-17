import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from '@studio-freight/lenis';
import CanvasScrub from './components/CanvasScrub.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef();

  // Lenis Smooth Scroll Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerArgs = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerArgs);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerArgs);
    };
  }, []);

  // Description text timeline
  useGSAP(() => {
    const descTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#desc',
        start: 'top top',
        end: '+=400%',
        scrub: 1,
      }
    });

    descTl.to('#desc-1', { opacity: 1, y: 0, duration: 1 })
      .to('#desc-1', { opacity: 0, y: -30, duration: 1, delay: 2 })
      .to('#desc-2', { opacity: 1, y: 0, duration: 1, delay: 1 })
      .to('#desc-2', { opacity: 0, y: -30, duration: 1, delay: 2 });
  }, { scope: containerRef });

  // Hover Effect Control
  const hoverVideoRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverVideoRef.current) {
      hoverVideoRef.current.currentTime = 0;
      hoverVideoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (hoverVideoRef.current) {
      hoverVideoRef.current.pause();
    }
  };

  return (
    <div className="smooth-scroll" ref={containerRef}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">Visionary</div>
        <div className="nav-links">
          <a href="#hero">Overview</a>
          <a href="#desc">Features</a>
          <a href="#product">Buy</a>
        </div>
      </nav>

      {/* Hero Canvas */}
      <CanvasScrub
        sectionId="hero"
        frameCount={145}
        folderPath="/assets/ffmpeg_images/hero_frames"
        scrubDistance="250%"
      >
        <div className="content-overlay hero-content">
          <h1 className="hero-title">Beyond Reality.</h1>
          <p className="hero-subtitle">Experience the next generation.</p>
        </div>
      </CanvasScrub>

      {/* Description Canvas */}
      <CanvasScrub
        sectionId="desc"
        frameCount={271}
        folderPath="/assets/ffmpeg_images/desc_frames"
        scrubDistance="400%"
      >
        <div className="content-overlay desc-content">
          <div className="desc-box" id="desc-1">
            <h2>Unmatched Precision</h2>
            <p>Every detail engineered for perfection.</p>
          </div>
          <div className="desc-box" id="desc-2">
            <h2>Infinite Power</h2>
            <p>Seamless performance that pushes boundaries.</p>
          </div>
        </div>
      </CanvasScrub>

      {/* Title Canvas */}
      <CanvasScrub
        sectionId="title-sec"
        frameCount={46}
        folderPath="/assets/ffmpeg_images/title_frames"
        scrubDistance="150%"
      >
        {/* Only visual title */}
      </CanvasScrub>

      {/* Product Hover Section */}
      <section className="product-section" id="product">
        <div className="product-container">
          <div className="product-header">
            <h2>Explore the Vision</h2>
            <p>Hover over the core to ignite the sequence.</p>
          </div>

          <div
            className="product-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="product-media">
              <img src="/assets/hover_poster.png" alt="Product Poster" className="product-poster" />
              <video
                ref={hoverVideoRef}
                src="/assets/hover_video.mp4"
                className="product-video"
                muted
                loop
                playsInline
              ></video>
            </div>
            <div className="product-info">
              <h3>Core Engine</h3>
              <p>The beating heart of tomorrow's technology.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 Visionary Tech. All rights reserved.</p>
      </footer>
    </div>
  );
}
