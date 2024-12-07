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
                    node-based app for building machine learning workflows.
                    Design pipelines and generate Python code using AI.
                    Perfect for exploring ideas, experimenting, or tackling challenges. Turn imagination
                    into reality, one node at a time! 🚀
                </p>



                <div className='info-footer'>
                    <a href="https://angelmacwan.github.io"
                        rel='noreferrer'
                        target='_blank'>
                        Find Me
                    </a>

                    <a href="mailto:angel.macwan@proton.me"
                        rel='noreferrer'
                        target='_blank'>
                        Feature Request
                    </a>

                    <span>
                        Release: Alpha <br />
                        Version 1
                    </span>

                </div>
            </div>
        </div>
    );
}