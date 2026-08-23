import "./Info.css";

export default function Info({ onClose }) {
    return (
        <div className="info-container" onClick={onClose}>
            <div className='info-details' onClick={e => e.stopPropagation()}>
                <h1>
                    <img src="logo.png" alt="Pluto" />
                    <span>Pluto</span>
                </h1>

                <h3>Visual ML Pipeline Builder</h3>

                <p>
                    Build machine learning workflows visually using a node-based canvas.
                    Connect data loaders, processors, models and outputs to design pipelines
                    and generate Python code — no boilerplate needed.
                </p>

                <p className="info-dismiss-hint">Click anywhere outside this card to dismiss</p>

                <button className="info-start-btn" onClick={onClose}>
                    Get Started →
                </button>

                <div className='info-footer'>
                    <a href="https://angelmacwan.github.io"
                        rel='noreferrer'
                        target='_blank'>
                        About
                    </a>

                    <a href="mailto:angel.macwan@proton.me"
                        rel='noreferrer'
                        target='_blank'>
                        Feature Request
                    </a>

                    <span>
                        Release: Alpha<br />
                        Version 1
                    </span>
                </div>
            </div>
        </div>
    );
}