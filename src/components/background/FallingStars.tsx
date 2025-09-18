import React, {useEffect, useState} from "react";
import '../../index.css';
interface Stars {
    id: number;
    left: number;
    delay: number;
}

const FallingStars: React.FC = () => {
    const [stars, setStars] = useState<Stars[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newStar: Stars = {
                id: Date.now(),
                left: Math.random() * 100,
                delay: Math.random() * 2,
            };

            setStars((prev) => [...prev, newStar]);

            setTimeout(() => {
                setStars((prev) => prev.filter((star) => star.id !== newStar.id));
            }, 5000);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="">
        
            {stars.map((star) => (
                <div key={star.id}

                    className="falling-star"
                    style={{
                        left: `${star.left}%`,
                        animationDelay: `${star.delay}s`,
                    }}
                />
            ))}
        
        </div>
    );
};

export default FallingStars;