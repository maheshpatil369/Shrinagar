import { useEffect, useRef } from "react";

const ThreeDBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set canvas size
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);
    resize();

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.5;
      mouseY = (e.clientY - height / 2) * 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Star/Particle Class
    class Star {
      x: number;
      y: number;
      z: number;
      color: string;
      size: number;

      constructor() {
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = Math.random() * width;
        // Mix of Brand Yellow (Gold) and White
        this.color = Math.random() > 0.3 ? "#FFD700" : "#FFFFFF"; 
        this.size = Math.random() * 2;
      }

      update(speed: number) {
        // Move star closer (decrease Z)
        this.z -= speed;

        // Reset if it passes the screen
        if (this.z <= 0) {
          this.z = width;
          this.x = (Math.random() - 0.5) * width * 2;
          this.y = (Math.random() - 0.5) * height * 2;
        }
      }

      draw() {
        if (!ctx) return;

        // 3D projection formula
        // x2d = x * (fov / z) + center_x
        const fov = 400; 
        const scale = fov / (fov + this.z);
        
        // Add parallax effect with mouse
        const x2d = (this.x - mouseX) * scale + width / 2;
        const y2d = (this.y - mouseY) * scale + height / 2;

        // Size scales with proximity
        const s = this.size * scale * 2;

        if (x2d >= 0 && x2d <= width && y2d >= 0 && y2d <= height) {
          ctx.beginPath();
          ctx.arc(x2d, y2d, s, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          // Fade out distant stars
          ctx.globalAlpha = scale * 1.5 > 1 ? 1 : scale * 1.5; 
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Initialize stars
    const stars: Star[] = [];
    const numStars = 800; // Density
    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = "#020817"; // Deep Blue Background (matches your theme)
      ctx.fillRect(0, 0, width, height);

      // Draw subtle gradient overlay for depth
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      gradient.addColorStop(0, "rgba(15, 35, 66, 0.3)"); // Lighter center
      gradient.addColorStop(1, "rgba(2, 8, 23, 0.8)");   // Darker edges
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw stars
      stars.forEach((star) => {
        star.update(2); // Speed
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full pointer-events-none"
    />
  );
};

export default ThreeDBackground;