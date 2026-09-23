import { useState } from "react";
import "./message.css";

function Message({
    message,
    role,
    images = [],
}) {
    const [selectedImage, setSelectedImage] = useState(null);

    const isUser = role === "user";

    return (
        <>
            <div
                className={`message ${
                    isUser ? "user" : "garuda"
                }`}
            >

                {/* =========================================
                    USER IMAGE
                   ========================================= */}

                {isUser && images?.length > 0 && (
                    <div className="message-images">

                        {images.map((image, index) => {

                            const imageUrl =
                                image.previewUrl ||
                                image.url;

                            if (!imageUrl) {
                                return null;
                            }

                            return (
                                <button
                                    key={
                                        image.id ||
                                        image.imageId ||
                                        index
                                    }
                                    className="message-image-button"
                                    type="button"
                                    onClick={() =>
                                        setSelectedImage(
                                            imageUrl
                                        )
                                    }
                                >
                                    <img
                                        src={imageUrl}
                                        alt={
                                            image.name ||
                                            "Uploaded image"
                                        }
                                        className="message-image"
                                    />
                                </button>
                            );
                        })}

                    </div>
                )}


                {/* =========================================
                    MESSAGE TEXT
                   ========================================= */}

                <div className="user-question-text">
                    {message}
                </div>

            </div>


            {/* =============================================
                FULL IMAGE VIEWER
               ============================================= */}

            {selectedImage && (
                <div
                    className="image-viewer-overlay"
                    onClick={() =>
                        setSelectedImage(null)
                    }
                >

                    <button
                        type="button"
                        className="image-viewer-close"
                        onClick={() =>
                            setSelectedImage(null)
                        }
                    >
                        ×
                    </button>


                    <img
                        src={selectedImage}
                        alt="Full size preview"
                        className="image-viewer-image"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    />

                </div>
            )}
        </>
    );
}

export default Message;