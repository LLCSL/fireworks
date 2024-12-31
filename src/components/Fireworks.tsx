import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FireworkParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  alpha: number;
  trail: THREE.Vector3[];
  trailLength: number;
}

const Fireworks = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建圆形纹理
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      const size = 32;
      canvas.width = size;
      canvas.height = size;
      
      const context = canvas.getContext('2d');
      if (!context) return null;

      // 创建径向渐变
      const gradient = context.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);

      return new THREE.CanvasTexture(canvas);
    };

    // 检测是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // 根据设备类型调整参数
    const params = {
      particleCount: isMobile ? 100 : 200,     // 增加粒子数量使形状更清晰
      particleSize: isMobile ? 8 : 6,          // 增大粒子尺寸
      velocityFactor: isMobile ? 1.5 : 2,      // 减小爆炸范围使形状更紧凑
      launchInterval: isMobile ? [600, 1200] : [400, 800],
    };

    // 场景设置
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // 调整相机参数，降低仰角
    const camera = new THREE.PerspectiveCamera(
      30,  // 降低FOV角度到30度，获得更远的视野
      window.innerWidth / window.innerHeight,
      1,   
      5000  // 增加远平面距离
    );
    
    // 修改相机参数，调整视角
    camera.position.z = isMobile ? 800 : 700;
    camera.position.y = -150;  // 减小仰角
    camera.lookAt(0, 100, 0);  // 降低观察点

    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile,
      powerPreference: "high-performance",
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // 设置透明背景
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 粒子系统
    const particles: FireworkParticle[] = [];
    const geometry = new THREE.BufferGeometry();
    const circleTexture = createCircleTexture();
    
    const material = new THREE.PointsMaterial({
      size: params.particleSize,
      map: circleTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      vertexColors: true,
      depthWrite: false, // 禁用深度写入，防止粒子相互遮挡
      depthTest: true    // 保持深度测试以保持与其他3D对象的正确交互
    });

    // 计算可视范围
    const getVisibleRange = () => {
      const fov = camera.fov * Math.PI / 180;
      const visibleHeight = 2 * Math.tan(fov / 2) * Math.abs(camera.position.z);
      const visibleWidth = visibleHeight * camera.aspect;

      // 调整偏移量
      const scaleFactor = 0.4; // 增加可视范围
      const verticalOffset = visibleHeight * 0.3; // 减小垂直偏移

      return {
        width: visibleWidth * scaleFactor,
        height: visibleHeight * scaleFactor,
        left: -visibleWidth * scaleFactor / 2,
        right: visibleWidth * scaleFactor / 2,
        bottom: (-visibleHeight * scaleFactor / 2) + verticalOffset,
        top: (visibleHeight * scaleFactor / 2) + verticalOffset
      };
    };

    // 获取随机位置
    // const getRandomPosition = () => {
    //   const visible = getVisibleRange();
    //   const margin = 30; // 减小边距

    //   return {
    //     x: visible.left + margin + Math.random() * (visible.width - margin * 2),
    //     y: visible.bottom + margin + Math.random() * (visible.height - margin * 2),
    //     z: Math.random() * 20 - 10  // 减小深度范围
    //   };
    // };

    // 添加渐变色生成器
    const createGradientColor = () => {
      const gradients = [
        // 彩虹渐变
        [
          new THREE.Color(1, 0, 0),      // 红
          new THREE.Color(1, 0.5, 0),    // 橙
          new THREE.Color(1, 1, 0),      // 黄
          new THREE.Color(0, 1, 0),      // 绿
          new THREE.Color(0, 0.5, 1),    // 蓝
          new THREE.Color(0.5, 0, 1)     // 紫
        ],
        // 梦幻粉紫
        [
          new THREE.Color(1, 0.4, 0.8),  // 粉红
          new THREE.Color(0.8, 0.3, 1),  // 紫色
          new THREE.Color(0.6, 0.4, 1),  // 淡紫
          new THREE.Color(1, 0.6, 0.8)   // 浅粉
        ],
        // 海洋蓝绿
        [
          new THREE.Color(0, 1, 0.8),    // 青绿
          new THREE.Color(0, 0.8, 1),    // 天蓝
          new THREE.Color(0, 0.6, 1),    // 深蓝
          new THREE.Color(0.4, 1, 0.8)   // 浅绿
        ],
        // 金色系
        [
          new THREE.Color(1, 0.84, 0),   // 金色
          new THREE.Color(1, 0.7, 0.2),  // 亮金
          new THREE.Color(1, 0.9, 0.3),  // 浅金
          new THREE.Color(1, 0.6, 0)     // 橙金
        ],
        // 火焰色
        [
          new THREE.Color(1, 0.2, 0),    // 深红
          new THREE.Color(1, 0.4, 0),    // 橙红
          new THREE.Color(1, 0.6, 0),    // 橙色
          new THREE.Color(1, 0.8, 0)     // 金黄
        ],
        // 霓虹系
        [
          new THREE.Color(1, 0, 0.5),    // 霓虹粉
          new THREE.Color(0.2, 1, 0.5),  // 霓虹绿
          new THREE.Color(0.5, 0, 1),    // 霓虹紫
          new THREE.Color(0, 1, 1)       // 霓虹蓝
        ],
        // 多彩混合
        [
          new THREE.Color(1, 0.2, 0.2),  // 红色
          new THREE.Color(0.2, 1, 0.2),  // 绿色
          new THREE.Color(0.2, 0.2, 1),  // 蓝色
          new THREE.Color(1, 1, 0.2)     // 黄色
        ]
      ];

      // 随机选择一个渐变组
      const gradient = gradients[Math.floor(Math.random() * gradients.length)];
      
      // 有时候使用渐变中的多个颜色
      if (Math.random() < 0.3) {
        const colors = [];
        const count = 2 + Math.floor(Math.random() * 3); // 2-4个颜色
        for (let i = 0; i < count; i++) {
          colors.push(gradient[Math.floor(Math.random() * gradient.length)]);
        }
        return colors[Math.floor(Math.random() * colors.length)];
      }
      
      // 否则返回单个颜色
      return gradient[Math.floor(Math.random() * gradient.length)];
    };

    // 修改形状生成逻辑
    const createFirework = (x: number, y: number, z: number = 0, isRising = false) => {
      const shapes = ['sphere', 'ring', 'double', 'heart', 'burst'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = createGradientColor();

      if (isRising) {
        // 上升火花保持不变
        particles.push({
          position: new THREE.Vector3(x, y, z),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 3 + 4,
            (Math.random() - 0.5) * 0.5
          ),
          color: color.clone(),
          alpha: 1,
          trail: [],
          trailLength: 8
        });
      } else {
        const pos = new THREE.Vector3(x, y, z);
        const particleCount = params.particleCount;

        switch (shape) {
          case 'sphere':
            // 球形爆炸 - 更均匀的分布
            for (let i = 0; i < particleCount; i++) {
              const phi = Math.acos(-1 + (2 * i) / particleCount);
              const theta = Math.PI * (1 + Math.sqrt(5)) * i;
              
              const direction = new THREE.Vector3(
                Math.cos(theta) * Math.sin(phi),
                Math.sin(theta) * Math.sin(phi),
                Math.cos(phi)
              );
              createParticle(pos, direction, color, params.velocityFactor * 1.2);
            }
            break;

          case 'heart':
            // 心形爆炸 - 调整大小和方向
            for (let i = 0; i < particleCount; i++) {
              const angle = (i / particleCount) * Math.PI * 2;
              const scale = 2.0; // 增大心形尺寸
              
              // 心形方程
              const x = scale * 16 * Math.pow(Math.sin(angle), 3);
              const y = scale * (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
              
              // 调整方向和速度
              const direction = new THREE.Vector3(x * 0.1, y * 0.1, 0).normalize();
              createParticle(pos, direction, color, params.velocityFactor * 1.5);
              
              // 添加填充粒子
              if (i % 2 === 0) {
                const innerScale = 0.7 + Math.random() * 0.3;
                const innerDirection = direction.clone().multiplyScalar(innerScale);
                createParticle(pos, innerDirection, color, params.velocityFactor * 1.2);
              }
            }
            break;

          case 'ring':
            // 环形爆炸 - 双层环
            for (let i = 0; i < particleCount; i++) {
              const angle = (i / particleCount) * Math.PI * 2;
              // 主环
              const direction = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                (Math.random() - 0.5) * 0.1
              );
              createParticle(pos, direction, color, params.velocityFactor * 1.3);
              
              // 内环
              if (i % 2 === 0) {
                const innerDirection = direction.clone().multiplyScalar(0.6);
                createParticle(pos, innerDirection, color, params.velocityFactor);
              }
            }
            break;

          case 'double':
            // 双环爆炸 - 更清晰的双层
            for (let i = 0; i < particleCount; i++) {
              const angle = (i / particleCount) * Math.PI * 2;
              // 外环
              createParticle(pos, new THREE.Vector3(
                Math.cos(angle) * 1.4,
                Math.sin(angle) * 1.4,
                0
              ), color, params.velocityFactor * 1.2);
              
              // 内环
              createParticle(pos, new THREE.Vector3(
                Math.cos(angle) * 0.7,
                Math.sin(angle) * 0.7,
                0
              ), color, params.velocityFactor);
            }
            break;

          case 'burst':
            // 爆裂形状 - 更密集的爆炸效果
            for (let i = 0; i < particleCount * 1.5; i++) {
              const angle = (i / particleCount) * Math.PI * 2;
              const height = Math.random() * 2 - 1;
              const direction = new THREE.Vector3(
                Math.cos(angle),
                height,
                Math.sin(angle)
              ).normalize();
              const speed = params.velocityFactor * (1 + Math.random() * 0.5);
              createParticle(pos, direction, color, speed);
            }
            break;
        }

        // 添加装饰粒子
        const decorationCount = Math.floor(particleCount * (shape === 'heart' ? 0.5 : 0.3));
        addDecorationParticles(pos, color, decorationCount);
      }
    };

    // 修改创建粒子函数，添加颜色变化
    const createParticle = (pos: THREE.Vector3, direction: THREE.Vector3, color: THREE.Color, speed: number) => {
      const randomSpeed = speed * (0.9 + Math.random() * 0.2);
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );

      // 随机调整颜色
      const adjustedColor = color.clone();
      if (Math.random() < 0.3) {
        adjustedColor.offsetHSL(
          (Math.random() - 0.5) * 0.1,   // 色相微调
          (Math.random() - 0.5) * 0.2,    // 饱和度调整
          (Math.random() - 0.5) * 0.2     // 亮度调整
        );
      }

      particles.push({
        position: pos.clone(),
        velocity: direction.multiplyScalar(randomSpeed).add(randomOffset),
        color: adjustedColor,
        alpha: 1,
        trail: [],
        trailLength: 5
      });
    };

    // 辅助函数：添加装饰粒子
    const addDecorationParticles = (pos: THREE.Vector3, color: THREE.Color, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const direction = new THREE.Vector3(
          Math.cos(angle) * Math.sin(phi),
          Math.sin(angle) * Math.sin(phi),
          Math.cos(phi)
        );
        createParticle(pos, direction, color, params.velocityFactor * 0.5);
      }
    };

    // 修改更新粒子系统的函数
    const updateParticles = () => {
      // 计算需要的顶点数量（包括轨迹）
      let totalVertices = 0;
      particles.forEach(particle => {
        totalVertices += 1 + particle.trail.length; // 当前位置 + 轨迹点
      });

      const positions = new Float32Array(totalVertices * 3);
      const colors = new Float32Array(totalVertices * 3);
      let index = 0;

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // 更新位置和速度
        particle.velocity.y -= 0.05;
        particle.position.add(particle.velocity);
        particle.alpha -= 0.01;

        // 更新轨迹
        particle.trail.unshift(particle.position.clone());
        if (particle.trail.length > particle.trailLength) {
          particle.trail.pop();
        }

        if (particle.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // 添加当前位置
        positions[index * 3] = particle.position.x;
        positions[index * 3 + 1] = particle.position.y;
        positions[index * 3 + 2] = particle.position.z;

        colors[index * 3] = particle.color.r * particle.alpha;
        colors[index * 3 + 1] = particle.color.g * particle.alpha;
        colors[index * 3 + 2] = particle.color.b * particle.alpha;

        index++;

        // 添加轨迹点
        for (let j = 0; j < particle.trail.length; j++) {
          const pos = particle.trail[j];
          const trailAlpha = particle.alpha * (1 - j / particle.trail.length);

          positions[index * 3] = pos.x;
          positions[index * 3 + 1] = pos.y;
          positions[index * 3 + 2] = pos.z;

          colors[index * 3] = particle.color.r * trailAlpha;
          colors[index * 3 + 1] = particle.color.g * trailAlpha;
          colors[index * 3 + 2] = particle.color.b * trailAlpha;

          index++;
        }
      }

      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions.slice(0, index * 3), 3)
      );
      geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors.slice(0, index * 3), 3)
      );

      material.size = params.particleSize * (isMobile ? 1.5 : 1);
    };

    // 修改自动发射函数，增加随机性
    const autoLaunch = () => {
      const visible = getVisibleRange();
      const x = (Math.random() - 0.5) * visible.width * 1.5;
      const startY = visible.bottom - 20;
      const startX = x + (Math.random() - 0.5) * 50;
      const startZ = (Math.random() - 0.5) * 100;
      
      createFirework(startX, startY, startZ, true);
      
      setTimeout(() => {
        // 调整爆炸高度范围
        const explosionHeight = visible.bottom + visible.height * (0.4 + Math.random() * 0.3);
        const explosionZ = startZ + (Math.random() - 0.5) * 50;
        createFirework(x, explosionHeight, explosionZ);
      }, 800);

      const [minInterval, maxInterval] = params.launchInterval;
      setTimeout(autoLaunch, minInterval + Math.random() * (maxInterval - minInterval));
    };

    // 修改点击处理函数
    const handleInteraction = (clientX: number, _clientY: number) => {
      const visible = getVisibleRange();
      const x = (clientX / window.innerWidth) * visible.width * 1.2 + visible.left;
      const z = (Math.random() - 0.5) * 100;
      
      const startY = visible.bottom - 20;
      createFirework(x, startY, z, true);
      
      setTimeout(() => {
        const explosionHeight = visible.bottom + visible.height * (0.4 + Math.random() * 0.3);
        createFirework(x, explosionHeight, z + (Math.random() - 0.5) * 50);
      }, 800);
    };

    // 同时支持点击和触摸
    const handleClick = (event: MouseEvent) => {
      handleInteraction(event.clientX, event.clientY);
    };

    const handleTouch = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      handleInteraction(touch.clientX, touch.clientY);
    };

    // 添加场景旋转控制
    const rotationState = {
      angle: 0,
      speed: 0.0002,
      radius: isMobile ? 600 : 500,
      autoRotate: true,
      targetX: 0,
      targetY: 100,  // 降低目标观察点
      currentX: 0,
      currentY: 100, // 同步调整当前高度
      smoothFactor: 0.05
    };

    // 修改星空背景的闪烁效果
    const createStars = () => {
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        blending: THREE.AdditiveBlending,
        transparent: true,
        color: 0xffffff,
        vertexColors: true,
        sizeAttenuation: false
      });

      // 减少星星数量
      const starCount = isMobile ? 500 : 1000;
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      const starOpacities = new Float32Array(starCount);
      const starSpeeds = new Float32Array(starCount);
      
      // 增加分布范围，使星星更分散
      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 3000;     // 增加水平范围
        starPositions[i * 3 + 1] = Math.random() * 1500 - 300;   // 增加垂直范围
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1500; // 增加深度范围
        
        starOpacities[i] = Math.random();
        starSpeeds[i] = Math.random() * 0.01 + 0.002;

        // 降低初始亮度
        starColors[i * 3] = 0.4;     // R
        starColors[i * 3 + 1] = 0.4; // G
        starColors[i * 3 + 2] = 0.4; // B
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      const starPoints = new THREE.Points(starGeometry, starMaterial);
      scene.add(starPoints);

      return () => {
        const colors = starGeometry.attributes.color.array as Float32Array;
        
        for (let i = 0; i < starCount; i++) {
          starOpacities[i] += starSpeeds[i];
          if (starOpacities[i] > 1) {
            starOpacities[i] = 0;
          }
          
          // 进一步降低闪烁范围
          const opacity = 0.08 + Math.sin(starOpacities[i] * Math.PI) * 0.08;
          colors[i * 3] = opacity;     // R
          colors[i * 3 + 1] = opacity; // G
          colors[i * 3 + 2] = opacity; // B
        }
        
        starGeometry.attributes.color.needsUpdate = true;
      };
    };

    // 创建星空并获取更新函数
    const updateStars = createStars();

    // 修改动画循环
    const animate = () => {
      requestAnimationFrame(animate);

      if (rotationState.autoRotate) {
        rotationState.angle += rotationState.speed;
        camera.position.x = Math.sin(rotationState.angle) * rotationState.radius;
        camera.position.z = Math.cos(rotationState.angle) * rotationState.radius;
      }

      // 平滑过渡到目标位置
      rotationState.currentX += (rotationState.targetX - rotationState.currentX) * rotationState.smoothFactor;
      rotationState.currentY += (rotationState.targetY - rotationState.currentY) * rotationState.smoothFactor;
      
      camera.lookAt(rotationState.currentX, rotationState.currentY, 0);
      
      // 更新星星闪烁
      updateStars();
      
      updateParticles();
      renderer.render(scene, camera);
    };

    // 添加鼠标移动交互
    const handleMouseMove = (event: MouseEvent) => {
      if (!rotationState.autoRotate) {
        const mouseX = (event.clientX - window.innerWidth / 2) * 0.2;
        const mouseY = (event.clientY - window.innerHeight / 2) * 0.2;
        
        rotationState.targetX = mouseX;
        rotationState.targetY = 100 - mouseY * 0.5;
      }
    };

    // 添加鼠标按下事件
    const handleMouseDown = () => {
      rotationState.autoRotate = false;
    };

    // 添加鼠标释放事件
    const handleMouseUp = () => {
      rotationState.autoRotate = true;
    };

    // 添加触摸事件处理
    const handleTouchMove = (event: TouchEvent) => {
      if (!rotationState.autoRotate && event.touches.length === 1) {
        const touch = event.touches[0];
        const mouseX = (touch.clientX - window.innerWidth / 2) * 0.2;
        const mouseY = (touch.clientY - window.innerHeight / 2) * 0.2;
        
        rotationState.targetX = mouseX;
        rotationState.targetY = 100 - mouseY * 0.5;
      }
    };

    const handleTouchStart = () => {
      rotationState.autoRotate = false;
    };

    const handleTouchEnd = () => {
      rotationState.autoRotate = true;
    };

    // 修改事件监听
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    // 动画循环
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 窗口大小调整
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // 事件监听
    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouch);
    
    animate();
    autoLaunch();

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouch);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
        userSelect: 'none',
        background: '#000' // 确保背景是黑色
      }}
    ></div>
  );
};

export default Fireworks; 