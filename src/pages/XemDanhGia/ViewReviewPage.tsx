import React, { useState, useEffect, useCallback } from 'react';
import { Star, Send, User, MessageCircle, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { decodeToken } from '../DanhGia/ReviewPage';

// Update interfaces
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
    userId?: string;
    content: string;
    ratingStar: number;
}

interface FormErrors {
    auth?: string;
    content?: string;
    ratingStar?: string;
    submit?: string;
}

interface RatingStats {
    [key: number]: number;
}

// Add API service
const API_URL = 'https://restaurant-manager-be-f7mh.onrender.com/restaurant/api';

const ViewReviewPage: React.FC = () => {
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

    // Memoize fetchReviews to prevent unnecessary re-renders
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/review`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.data && Array.isArray(result.data)) {
                const sortedReviews = result.data
                    .filter((review: Review) => review && review.starRating)
                    .sort((a: Review, b: Review) =>
                        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                    );
                setReviews(sortedReviews);
            }
        } catch (error) {
            console.error('Lỗi khi tải đánh giá:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const userId = getUserIdFromToken();

        // Validate authentication
        if (!userId) {
            newErrors.auth = 'Vui lòng đăng nhập để đánh giá';
            setErrors(newErrors);
            return false;
        }

        // Validate content
        if (!formData.content?.trim()) {
            newErrors.content = 'Vui lòng nhập nội dung đánh giá';
        } else if (formData.content.trim().length < 10) {
            newErrors.content = 'Nội dung đánh giá phải có ít nhất 10 ký tự';
        } else if (formData.content.length > 500) {
            newErrors.content = 'Nội dung không được quá 500 ký tự';
        }

        // Validate star rating
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = getUserIdFromToken();
        if (!userId) {
            alert('Vui lòng đăng nhập để đánh giá');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitLoading(true);
        try {
            const params = new URLSearchParams({
                userId: userId.toString(),
                content: formData.content,
                ratingStar: formData.ratingStar.toString()
            });

            const response = await fetch(`https://restaurant-manager-be-f7mh.onrender.com/restaurant/api/review?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitSuccess(true);
                setFormData({
                    userId: '',
                    content: '',
                    ratingStar: 0
                });
                fetchReviews(); // Reload reviews

                setTimeout(() => setSubmitSuccess(false), 3000);

                // Scroll to reviews section
                document.getElementById('reviews-section')?.scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                alert('Có lỗi xảy ra: ' + (result.message || 'Vui lòng thử lại'));
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Không thể kết nối đến server');
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
        // Clear error when user starts typing
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

    const renderStars = useCallback((rating: number, interactive: boolean = false, size: number = 24) => {
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
    }, [hoverRating]);

    const getAverageRating = useCallback((): number => {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, review) => acc + (review.starRating || 0), 0);
        return Number((sum / reviews.length).toFixed(1));
    }, [reviews]);

    const getRatingStats = useCallback((): RatingStats => {
        const stats: RatingStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            if (review.starRating >= 1 && review.starRating <= 5) {
                stats[review.starRating]++;
            }
        });
        return stats;
    }, [reviews]);

    // Add proper type for mouse events
    const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        target.style.borderColor = '#ffb366';
        target.style.transform = 'translateY(-2px)';
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        target.style.borderColor = 'transparent';
        target.style.transform = 'translateY(0)';
    };

    // Memoize these calculations
    const ratingStats = React.useMemo(() => getRatingStats(), [getRatingStats]);
    const maxCount = React.useMemo(() =>
        Math.max(...Object.values(ratingStats), 1), [ratingStats]);

    return (
        <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">

            {/* Sidebar */}
            <Sidebar />
            <div style={{
                minHeight: '100vh',
                flex: 1,
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



                    {/* Review Form */}


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
                                        {renderStars(Math.round(getAverageRating()), false, 28)}
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
                                        onMouseOver={handleMouseOver}
                                        onMouseOut={handleMouseOut}
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
        </div>
    );
};

export default ViewReviewPage;