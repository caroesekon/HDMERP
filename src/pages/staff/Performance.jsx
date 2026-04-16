import { useState, useEffect } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiSearch, HiStar,
  HiDocumentText, HiEye, HiFilter, HiUser, HiCalendar,
  HiChartBar, HiTrendingUp, HiTrendingDown
} from 'react-icons/hi';
import staffService from '../../services/staffService';
import PerformanceForm from '../../components/staff/PerformanceForm';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { printPerformanceReport } from '../../utils/printUtils';

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState({ type: null, data: null });
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewDetails, setViewDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, search, statusFilter]);

  useEffect(() => {
    calculateStats();
  }, [filtered]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await staffService.getPerformanceReviews();
      setReviews(res.data || []);
    } catch (error) {
      toast.error('Failed to load performance reviews');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];
    
    if (search) {
      filtered = filtered.filter(r => 
        r.staffId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        r.staffId?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        r.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter === 'completed') {
      filtered = filtered.filter(r => r.status === 'completed');
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(r => r.status === 'pending');
    } else if (statusFilter === 'in_progress') {
      filtered = filtered.filter(r => r.status === 'in_progress');
    }
    
    setFiltered(filtered);
  };

  const calculateStats = () => {
    const completed = filtered.filter(r => r.status === 'completed').length;
    const pending = filtered.filter(r => r.status === 'pending').length;
    const ratings = filtered.filter(r => r.rating).map(r => r.rating);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;
    
    setStats({
      total: filtered.length,
      completed,
      pending,
      averageRating: avgRating
    });
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete review "${title}"?`)) return;
    try {
      await staffService.deletePerformanceReview(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setViewDetails(true);
  };

  const handlePrint = (review) => {
    printPerformanceReport(review);
  };

  const handleFormSuccess = () => {
    setModal({ type: null, data: null });
    fetchReviews();
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <HiStar
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) return <Loader text="Loading performance reviews..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Performance Reviews</h2>
          <p className="text-gray-500 mt-1">Track and manage employee performance</p>
        </div>
        <Button onClick={() => setModal({ type: 'add', data: null })}>
          <HiPlus className="mr-2 h-4 w-4" />
          New Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={HiDocumentText}
          label="Total Reviews"
          value={stats.total}
          color="bg-blue-500"
        />
        <StatCard
          icon={HiStar}
          label="Completed"
          value={stats.completed}
          color="bg-green-500"
        />
        <StatCard
          icon={HiCalendar}
          label="Pending"
          value={stats.pending}
          color="bg-yellow-500"
        />
        <StatCard
          icon={HiChartBar}
          label="Avg Rating"
          value={stats.averageRating.toFixed(1)}
          color="bg-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              icon={<HiSearch />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Employee name or review title..."
            />
          </div>
          
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
            <HiFilter className="mr-1 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
            <HiDocumentText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No performance reviews found</p>
          </div>
        ) : (
          filtered.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{review.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {review.staffId?.firstName} {review.staffId?.lastName}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(review.status)}`}>
                  {review.status?.replace('_', ' ')}
                </span>
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <HiCalendar className="h-4 w-4 mr-2" />
                  {formatDate(review.reviewDate)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <HiUser className="h-4 w-4 mr-2" />
                  Reviewer: {review.reviewer?.name || 'N/A'}
                </div>
                {review.rating && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Rating:</span>
                    {renderStars(review.rating)}
                    <span className={`ml-2 font-semibold ${getRatingColor(review.rating)}`}>
                      {review.rating}/5
                    </span>
                  </div>
                )}
              </div>
              
              {review.strengths && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Strengths:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{review.strengths}</p>
                </div>
              )}
              
              {review.improvements && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Areas for Improvement:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{review.improvements}</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-2 pt-3 border-t">
                <button
                  onClick={() => handleViewDetails(review)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="View Details"
                >
                  <HiEye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePrint(review)}
                  className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                  title="Print"
                >
                  <HiDocumentText className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setModal({ type: 'edit', data: review })}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                  title="Edit"
                >
                  <HiPencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(review._id, review.title)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Performance Form Modal */}
      {modal.type && (
        <PerformanceForm
          isOpen={true}
          onClose={() => setModal({ type: null, data: null })}
          review={modal.data}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={viewDetails}
        onClose={() => { setViewDetails(false); setSelectedReview(null); }}
        title="Performance Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lg">{selectedReview.title}</h4>
              <p className="text-gray-600 mt-1">
                {selectedReview.staffId?.firstName} {selectedReview.staffId?.lastName} - {selectedReview.staffId?.position}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Review Date</p>
                <p className="font-medium">{formatDate(selectedReview.reviewDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Review Period</p>
                <p className="font-medium">
                  {formatDate(selectedReview.periodStart)} - {formatDate(selectedReview.periodEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reviewer</p>
                <p className="font-medium">{selectedReview.reviewer?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedReview.status)}`}>
                  {selectedReview.status?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {selectedReview.rating && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Overall Rating</p>
                <div className="flex items-center">
                  {renderStars(selectedReview.rating)}
                  <span className={`ml-2 font-semibold text-lg ${getRatingColor(selectedReview.rating)}`}>
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>
            )}

            {selectedReview.categories && selectedReview.categories.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Category Ratings</p>
                <div className="space-y-2">
                  {selectedReview.categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{cat.name}</span>
                      <div className="flex items-center">
                        {renderStars(cat.rating)}
                        <span className="ml-2 text-sm font-medium">{cat.rating}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReview.strengths && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Strengths</p>
                <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{selectedReview.strengths}</p>
              </div>
            )}

            {selectedReview.improvements && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Areas for Improvement</p>
                <p className="text-gray-700 bg-orange-50 p-3 rounded-lg">{selectedReview.improvements}</p>
              </div>
            )}

            {selectedReview.goals && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Goals & Objectives</p>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedReview.goals}</p>
              </div>
            )}

            {selectedReview.comments && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Additional Comments</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedReview.comments}</p>
              </div>
            )}

            {selectedReview.nextReviewDate && (
              <div>
                <p className="text-sm text-gray-500">Next Review Date</p>
                <p className="font-medium">{formatDate(selectedReview.nextReviewDate)}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => handlePrint(selectedReview)}>
                <HiDocumentText className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={() => { setViewDetails(false); setSelectedReview(null); }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center">
      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mr-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}