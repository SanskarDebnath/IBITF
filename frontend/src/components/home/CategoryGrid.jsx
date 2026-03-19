import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryGrid({ categories }) {
    // Simulate loading for demo
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="category-grid">
            {categories.map((category) => (
                <Link
                    key={category.key || category.id || category.name}
                    to={category.link}
                    className="category-tile"
                >
                    <div className={`category-tile__icon ${!loaded ? 'loading' : ''}`}>
                        {loaded && category.icon}
                    </div>
                    <div className="category-tile__name">
                        {category.name}
                    </div>
                </Link>
            ))}
        </div>
    );
}
