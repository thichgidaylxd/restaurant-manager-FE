// src/pages/NotFoundPage.tsx
import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>404 - Không tìm thấy trang</h1>
            <p style={styles.text}>Trang bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/" style={styles.link}>🔙 Quay về trang chủ</Link>
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center" as const,
        padding: "50px",
        fontFamily: "Arial"
    },
    title: {
        fontSize: "40px",
        color: "#e63946"
    },
    text: {
        fontSize: "18px",
        marginBottom: "30px"
    },
    link: {
        fontSize: "16px",
        color: "#1d3557",
        textDecoration: "none"
    }
};

export default NotFoundPage;
