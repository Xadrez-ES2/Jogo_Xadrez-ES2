import { useState, useEffect, useRef } from 'react';

/**
 * Componente isolado do Peão 3D Sólido
 * Desenvolvido para React + Tailwind CSS usando extrusão por micro-camadas CSS.
 */
export default function Piece3D({
	className = ""
} : { className?: string}) {

	// Configuração da física/extrusão do peão sólido
	const LAYER_COUNT = 38; 	// Densidade de fatias para fechar todas as brechas
	const LAYER_SPACING = 0.65; // Espaçamento milimétrico em pixels (0.65px)
	const ROTATION_SPEED = 8; 	// Tempo em segundos para uma volta completa (360°)
	const PITCH_ANGLE = 12; 	// Inclinação da câmera no eixo X

	const [rotY, setRotY] = useState(0);
	const animFrameRef = useRef<number | null>(null);

	// Animação de rotação contínua e suave em 3D
	useEffect(() => {
		
		let lastTime = performance.now();

		const animate = (now: number) => {
			const delta = (now - lastTime) / 1000;
			lastTime = now;
			const degPerSec = 360 / ROTATION_SPEED;
			setRotY((prev) => (prev + degPerSec * delta) % 360);
			animFrameRef.current = requestAnimationFrame(animate);
		};

		animFrameRef.current = requestAnimationFrame(animate);
		return () => {
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
		};
	}, []);

	// SVG da Peça (Pawn) otimizado para preenchimento volumétrico
	const pawnSvgPath = "M12 2a3 3 0 0 0-3 3c0 1.125.62 2.102 1.537 2.61C9.07 8.358 8 9.98 8 12c0 1.25.4 2.39 1.08 3.32C7.38 15.93 6 17.77 6 20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1c0-2.23-1.38-4.07-3.08-4.68C15.6 14.39 16 13.25 16 12c0-2.02-1.07-3.642-2.537-4.39A3.001 3.001 0 0 0 12 2z";

	// Array para mapear as fatias centradas no eixo Z
	const layerIndices = Array.from({ length: LAYER_COUNT }, (_, i) => i - Math.floor(LAYER_COUNT / 2));

	const base = "min-h-screen flex items-center justify-center overflow-hidden p-6";

	const classes = `${base} ${className}`;

	return (
		<div className={classes}>
		
			{/* Container de Perspectiva 3D */}
			<div 
				className="relative w-80 h-80 flex items-center justify-center select-none"
				style={{ perspective: '1000px' }}
			>
				{/* Objeto 3D com Preservação Tridimensional */}
				<div
					className="relative w-64 h-64 flex items-center justify-center"
					style={{
						transformStyle: 'preserve-3d',
						transform: `rotateX(${PITCH_ANGLE}deg) rotateY(${rotY}deg)`
					}}
				>

					{/* 1. FACE FRONTAL (Dourado Vivo) */}
					<div
						className="absolute inset-0 flex items-center justify-center"
						style={{
							transform: `translateZ(${(LAYER_COUNT * LAYER_SPACING) / 2}px)`,
							backfaceVisibility: 'visible',
							filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.4))'
						}}
					>
						<svg viewBox="0 0 24 24" className="w-full h-full p-4 text-amber-400">
							<path 
								d={pawnSvgPath} 
								fill="currentColor"
								stroke="rgba(254, 240, 138, 0.5)"
								strokeWidth="0.3"
							/>
						</svg>
					</div>

					{/* 2. CAMADAS DE PREENCHIMENTO INTERNO (Gera a massa e espessura do bloco sólido) */}
					{layerIndices.map((offsetIndex, idx) => {
						const zPosition = offsetIndex * LAYER_SPACING;
						const isEdge = idx === 0 || idx === LAYER_COUNT - 1;

						// Cálculo do sombreamento lateral interno
						const normalizedDist = Math.abs(offsetIndex) / (LAYER_COUNT / 2);
						const brightness = isEdge ? 100 : Math.max(30, 100 - (65 * (1 - normalizedDist * 0.2)));

						return (
							<div
								key={idx}
								className="absolute inset-0 flex items-center justify-center pointer-events-none"
								style={{
									transform: `translateZ(${zPosition}px)`,
									backfaceVisibility: 'visible',
									color: '#b45309', // Tom escuro amadeirado/dourado nas laterais (amber-700)
									filter: `brightness(${brightness}%) contrast(1.15)`
								}}
							>
								<svg viewBox="0 0 24 24" className="w-full h-full p-4">
									
									<path 
										d={pawnSvgPath} 
										fill="currentColor"
										stroke="rgba(0,0,0,0.2)"
										strokeWidth="0.2"
									/>
								
								</svg>
							
							</div>
						);
					})}

					{/* 3. FACE TRASEIRA */}
					<div
						className="absolute inset-0 flex items-center justify-center"
						style={{
							transform: `rotateY(180deg) translateZ(${(LAYER_COUNT * LAYER_SPACING) / 2}px)`,
							backfaceVisibility: 'visible',
							filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.4))'
						}}
					>
						<svg viewBox="0 0 24 24" className="w-full h-full p-4 text-amber-400">
							<path 
								d={pawnSvgPath} 
								fill="currentColor"
								stroke="rgba(254, 240, 138, 0.5)"
								strokeWidth="0.3"
							/>
						</svg>
					
					</div>
			
				</div>

			</div>
		
		</div>
	);
}