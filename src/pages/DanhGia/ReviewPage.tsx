import React, { useState, useEffect } from 'react';
import { Star, Send, User, MessageCircle, RefreshCw } from 'lucide-react';

interface Review {
    id: string;
    content: string;
    starRating: number;
    createdAt: string;
    user?: {
        username?: string;
        name?: string;
    };
}

interface FormData {
    content: string;
    ratingStar: number;
}

interface FormErrors {
    auth?: string;
    content?: string;
    ratingStar?: string;
}

interface RatingStats {
    [key: number]: number;
}

export const decodeToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const ReviewPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        content: '',
        ratingStar: 0
    });
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://restaurant-manager-be-f7mh.onrender.com/restaurant/api/review');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.data && Array.isArray(result.data)) {
                const sortedReviews = result.data
                    .filter((review: Review) => review) // Filter out null/undefined
                    .sort((a: Review, b: Review) =>
                        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                    );
                setReviews(sortedReviews);
            }
        } catch (error) {
            console.error('Lỗi khi tải đánh giá:', error);
            setReviews([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };


    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const userId = getUserIdFromToken();

        if (!userId) {
            newErrors.auth = 'Vui lòng đăng nhập để đánh giá';
        }

        if (!formData.content?.trim()) {
            newErrors.content = 'Vui lòng nhập nội dung đánh giá';
        } else if (formData.content.length > 500) {
            newErrors.content = 'Nội dung không được quá 500 ký tự';
        }

        if (!formData.ratingStar || formData.ratingStar < 1 || formData.ratingStar > 5) {
            newErrors.ratingStar = 'Vui lòng chọn số sao đánh giá (1-5 sao)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }
        const decodedToken = decodeToken(token);
        return decodedToken?.userAccountId;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userId = getUserIdFromToken();
        if (!userId) {
            setErrors(prev => ({ ...prev, auth: 'Vui lòng đăng nhập để đánh giá' }));
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitLoading(true);
        try {
            const params = new URLSearchParams({
                userId: userId.toString(),
                content: formData.content.trim(),
                ratingStar: formData.ratingStar.toString()
            });

            const response = await fetch(
                `https://restaurant-manager-be-f7mh.onrender.com/restaurant/api/review?${params}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setSubmitSuccess(true);
            setFormData({ content: '', ratingStar: 0 });
            await fetchReviews();
            setTimeout(() => setSubmitSuccess(false), 3000);

            document.getElementById('reviews-section')?.scrollIntoView({
                behavior: 'smooth'
            });
        } catch (error) {
            console.error('Lỗi:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Không thể gửi đánh giá. Vui lòng thử lại sau.'
            }));
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleStarClick = (rating: number) => {
        setFormData(prev => ({
            ...prev,
            ratingStar: rating
        }));
        if (errors.ratingStar) {
            setErrors(prev => ({
                ...prev,
                ratingStar: ''
            }));
        }
    };

    const renderStars = (rating, interactive = false, size = 24) => {
        return (
            <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        style={{
                            cursor: interactive ? 'pointer' : 'default',
                            fill: star <= (interactive ? (hoverRating || rating) : rating) ? '#ff6b00' : 'none',
                            stroke: star <= (interactive ? (hoverRating || rating) : rating) ? '#ff6b00' : '#ffb366',
                            transition: 'all 0.2s'
                        }}
                        onClick={interactive ? () => handleStarClick(star) : undefined}
                        onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
                        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                    />
                ))}
            </div>
        );
    };

    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + (review.starRating || 0), 0);
        return (sum / reviews.length).toFixed(1);
    };

    const getRatingStats = () => {
        const stats: RatingStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            if (review.starRating >= 1 && review.starRating <= 5) {
                stats[review.starRating]++;
            }
        });
        return stats;
    };

    const ratingStats = getRatingStats();
    const maxCount = Math.max(...Object.values(ratingStats), 1);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fff5e6 0%, #ffe0b3 100%)',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#ff6b00',
                        marginBottom: '10px'
                    }}>
                        Đánh Giá Nhà Hàng
                    </h1>
                    <p style={{ color: '#ff8c00', fontSize: '16px' }}>
                        Chia sẻ trải nghiệm của bạn với chúng tôi
                    </p>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                    <div style={{
                        background: '#fff',
                        border: '2px solid #4ade80',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ color: '#4ade80', fontSize: '24px' }}>✓</div>
                        <div style={{ color: '#16a34a', fontWeight: '600' }}>
                            Cảm ơn bạn đã đánh giá! Ý kiến của bạn rất quan trọng với chúng tôi.
                        </div>
                    </div>
                )}

                {/* Review Form */}
                <div style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '40px',
                    marginBottom: '40px',
                    boxShadow: '0 10px 30px rgba(255, 107, 0, 0.2)'
                }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#ff6b00',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <MessageCircle size={24} />
                        Viết đánh giá của bạn
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* User ID */}
                        {!getUserIdFromToken() && (
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#fff5e6',
                                borderRadius: '10px',
                                marginBottom: '24px',
                                color: '#ff6b00',
                                textAlign: 'center'
                            }}>
                                <p style={{ margin: 0, fontWeight: '600' }}>
                                    Vui lòng đăng nhập để gửi đánh giá
                                </p>
                            </div>
                        )}

                        {/* Rating Stars */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#ff6b00'
                            }}>
                                <Star size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                                Đánh giá của bạn
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                {renderStars(formData.ratingStar, true, 32)}
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#ff6b00'
                                }}>
                                    {formData.ratingStar > 0 ? `${formData.ratingStar} sao` : 'Chưa chọn'}
                                </span>
                            </div>
                            {errors.ratingStar && (
                                <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '6px' }}>
                                    {errors.ratingStar}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#ff6b00'
                            }}>
                                Nội dung đánh giá
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Chia sẻ trải nghiệm của bạn tại nhà hàng..."
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: errors.content ? '2px solid #ef4444' : '2px solid #ffb366',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    boxSizing: 'border-box',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff6b00'}
                                onBlur={(e) => e.target.style.borderColor = errors.content ? '#ef4444' : '#ffb366'}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '6px',
                                fontSize: '14px'
                            }}>
                                {errors.content ? (
                                    <span style={{ color: '#ef4444' }}>{errors.content}</span>
                                ) : (
                                    <span style={{ color: '#999' }}>Tối đa 500 ký tự</span>
                                )}
                                <span style={{ color: formData.content.length > 500 ? '#ef4444' : '#999' }}>
                                    {formData.content.length}/500
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitLoading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: submitLoading ? '#ffb366' : '#ff6b00',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: submitLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 6px rgba(255, 107, 0, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                            onMouseOver={(e) => {
                                const button = e.target as HTMLButtonElement;
                                if (!submitLoading) button.style.backgroundColor = '#ff8c00';
                            }}
                            onMouseOut={(e) => {
                                const button = e.target as HTMLButtonElement;
                                if (!submitLoading) button.style.backgroundColor = '#ff6b00';
                            }}
                        >
                            <Send size={20} />
                            {submitLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </form>
                </div>

                {/* Reviews Section */}
                <div id="reviews-section">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: '#ff6b00',
                            margin: 0
                        }}>
                            Đánh giá từ khách hàng ({reviews.length})
                        </h2>
                        <button
                            onClick={fetchReviews}
                            disabled={loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                backgroundColor: '#ff6b00',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                            Làm mới
                        </button>
                    </div>

                    {/* Rating Summary */}
                    {reviews.length > 0 && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '24px',
                            boxShadow: '0 4px 12px rgba(255, 107, 0, 0.15)'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '24px',
                                alignItems: 'center'
                            }}>
                                {/* Average Rating */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff6b00', marginBottom: '8px' }}>
                                        {getAverageRating()}
                                    </div>
                                    {renderStars(Math.min(Math.max(Math.round(Number(getAverageRating())), 0), 5), false, 28)}
                                    <div style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
                                        Trung bình từ {reviews.length} đánh giá
                                    </div>
                                </div>

                                {/* Rating Breakdown */}
                                <div style={{ flex: 1 }}>
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <div key={star} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{ width: '60px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>{star}</span>
                                                <Star size={16} fill="#ff6b00" stroke="#ff6b00" />
                                            </div>
                                            <div style={{
                                                flex: 1,
                                                height: '8px',
                                                backgroundColor: '#ffe0b3',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${(ratingStats[star] / maxCount) * 100}%`,
                                                    height: '100%',
                                                    backgroundColor: '#ff6b00',
                                                    transition: 'width 0.3s'
                                                }} />
                                            </div>
                                            <div style={{ width: '40px', textAlign: 'right', fontSize: '14px', color: '#666' }}>
                                                {ratingStats[star]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews List */}
                    {loading && reviews.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: '#fff',
                            borderRadius: '12px'
                        }}>
                            <RefreshCw size={48} style={{ color: '#ff6b00', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                            <p style={{ color: '#ff8c00', fontSize: '18px', fontWeight: '600' }}>Đang tải đánh giá...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: '#fff',
                            borderRadius: '12px'
                        }}>
                            <MessageCircle size={48} style={{ color: '#ffb366', marginBottom: '16px' }} />
                            <p style={{ color: '#ff8c00', fontSize: '18px', fontWeight: '600' }}>
                                Chưa có đánh giá nào
                            </p>
                            <p style={{ color: '#999', fontSize: '14px' }}>
                                Hãy là người đầu tiên đánh giá nhà hàng
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    style={{
                                        background: '#fff',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        boxShadow: '0 2px 8px rgba(255, 107, 0, 0.1)',
                                        transition: 'all 0.3s',
                                        border: '2px solid transparent'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = '#ffb366';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '16px',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                backgroundColor: '#fff5e6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <User size={24} style={{ color: '#ff6b00' }} />
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    fontSize: '16px',
                                                    marginBottom: '4px'
                                                }}>
                                                    {review.user?.username || review.user?.name || 'Khách hàng'}
                                                </div>
                                                {renderStars(review.starRating || 0, false, 18)}
                                            </div>
                                        </div>
                                    </div>

                                    <p style={{
                                        color: '#666',
                                        fontSize: '15px',
                                        lineHeight: '1.6',
                                        margin: 0,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {review.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
            </style>
        </div>
    );
};

export default ReviewPage;