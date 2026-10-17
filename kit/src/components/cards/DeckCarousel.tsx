import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  code?: string;
}

export interface DeckCarouselProps {
  slides: CarouselSlide[];
  startFrame: number;
  slideDuration?: number; // Duration each slide stays in focus
  transitionDuration?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  accentColor?: string;
  style?: React.CSSProperties;
}

/** 3D Stacking Deck Carousel for Floorplans and Galleries */
export const DeckCarousel: React.FC<DeckCarouselProps> = ({
  slides,
  startFrame,
  slideDuration = 35,
  transitionDuration = 12,
  width = 820,
  height = 920,
  x = 540,
  y = 380,
  accentColor = '#DFB25A',
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const elapsed = frame - startFrame;
  const activeIndex = Math.min(
    slides.length - 1,
    Math.floor(elapsed / slideDuration)
  );

  // Frame progress within current slide transition
  const slideLocalFrame = elapsed % slideDuration;
  const isTransitioning = slideLocalFrame < transitionDuration && activeIndex > 0;
  const transP = isTransitioning
    ? ramp(slideLocalFrame, 0, transitionDuration, 0, 1, ease.expoOut)
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y,
        width,
        height,
        perspective: 1200,
        zIndex: 35,
        ...style,
      }}
    >
      {slides.map((slide, i) => {
        // Only render active slide and the next 2 stacked behind
        const diff = i - activeIndex;
        if (diff < -1 || diff > 2) return null;

        // Card stacking math
        let offsetZ = -diff * 90;
        let translateY = diff * 45;
        let scale = 1 - diff * 0.08;
        let opacity = diff === 0 ? 1 : diff > 0 ? 0.7 - diff * 0.25 : 0;
        let rotX = diff * 3;

        // Animate incoming transition
        if (diff === 0 && isTransitioning) {
          offsetZ = -90 * (1 - transP);
          translateY = 45 * (1 - transP);
          scale = 0.92 + transP * 0.08;
          opacity = 0.7 + transP * 0.3;
        } else if (diff === -1 && isTransitioning) {
          // Slide leaving fly-out
          translateY = -transP * 120;
          opacity = 1 - transP;
          scale = 1 + transP * 0.05;
        }

        return (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 24,
              overflow: 'hidden',
              background: 'linear-gradient(165deg, #181513, #0c0a09)',
              border: `1.5px solid ${diff === 0 ? accentColor : 'rgba(255, 255, 255, 0.12)'}`,
              boxShadow: `0 35px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
              transform: `translate3d(0, ${translateY}px, ${offsetZ}px) rotateX(${rotX}deg) scale(${scale})`,
              transformOrigin: '50% 100%',
              opacity,
              transition: 'border-color 0.3s',
            }}
          >
            {/* Slide Image */}
            {slide.imageUrl ? (
              <Img
                src={slide.imageUrl}
                style={{
                  width: '100%',
                  height: '75%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '75%',
                  background: 'radial-gradient(circle at 50% 50%, #292524, #0c0a09)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{color: accentColor, fontSize: 18, letterSpacing: '0.2em'}}>
                  {slide.code || `SLIDE // 0${i + 1}`}
                </div>
              </div>
            )}

            {/* Bottom Info Bar */}
            <div
              style={{
                height: '25%',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(12, 10, 9, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div
                  style={{
                    color: '#FAF8F5',
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {slide.title}
                </div>
                {slide.subtitle && (
                  <div style={{color: 'rgba(250, 248, 245, 0.6)', fontSize: 16, marginTop: 4}}>
                    {slide.subtitle}
                  </div>
                )}
              </div>

              {/* Progress counter pill */}
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: accentColor,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.1em',
                }}
              >
                {i + 1} / {slides.length}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
