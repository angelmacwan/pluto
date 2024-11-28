import "./Info.css"

export default function Info() {
    return (
        <div className="info-container">
            <div className='info-details'>
                <h1>
                    <img src="logo.png" alt="Pluto" />
                    <span> Pluto </span>
                </h1>

                <h3>Simplify Your ML Workflows</h3>

                <p>
                    a little passion project I created for fun, blending my love for tech and creativity!
                    This node-based app makes building machine learning workflows intuitive, playful, and rewarding.
                    With its drag-and-drop interface, you can easily design pipelines and generate Python code
                    using AI or custom in-built logic. Whether you're exploring ideas, experimenting,
                    or solving real-world challenges, Pluto is here to help you turn your imagination into
                    reality one node at a time!
                </p>

                <br />
                <small>click anywhere to continue</small>
                <br />

                <button onClick={() => {
                    window.open("https://angelmacwan.github.io", "_blank");
                }}>Find Me</button>
            </div>
        </div>
    );
}