import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Star, ArrowRight, Menu, X, Home } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../Context/AuthContext.jsx';

const toDateOnlyString = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AppointmentLanding() {
  const navigate = useNavigate();
  const { isLoggedIn, userRole, API_BASE_URL, getAuthHeaders, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingErrors, setBookingErrors] = useState({});
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState('');

  const testimonials = [
    { name: 'Sarah Johnson', text: 'Amazing service! The booking process was seamless.', rating: 5 },
    { name: 'Mike Chen', text: 'Professional and efficient. Highly recommend!', rating: 5 },
    { name: 'Emily Davis', text: 'Best experience I\'ve had. Will definitely return!', rating: 5 }
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError('');

      try {
        const response = await fetch(`${API_BASE_URL}/services/active`, {
          headers: getAuthHeaders()
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Unable to load services');
        }

        if (isMounted) {
          setAvailableServices(payload.data?.services || []);
        }
      } catch (error) {
        console.error('Landing services fetch failed:', error);
        if (isMounted) {
          setAvailableServices([]);
          setServicesError(error.message || 'Unable to load services');
        }
      } finally {
        if (isMounted) {
          setServicesLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, getAuthHeaders]);

  const handleBookNow = () => {
    if (!isLoggedIn) {
      navigate('/user/login', { state: { from: 'landing' } });
      return;
    }

    setBookingModalOpen(true);
  };

  const resetBookingForm = () => {
    setBookingForm({
      serviceId: '',
      appointmentDate: '',
      appointmentTime: '',
      notes: ''
    });
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingErrors({});
    setBookingError('');
  };

  const closeBookingModal = () => {
    resetBookingForm();
    setBookingModalOpen(false);
  };

  const handleBookingSubmit = async () => {
    const fieldErrors = {};
    if (!bookingForm.serviceId) fieldErrors.serviceId = 'Please select a service';
    if (!bookingForm.appointmentDate) fieldErrors.appointmentDate = 'Please select a date';
    if (!bookingForm.appointmentTime) fieldErrors.appointmentTime = 'Please select a time';

    setBookingErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    if (!user) {
      setBookingError('Unable to detect your profile. Please refresh or re-login.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          serviceId: bookingForm.serviceId,
          appointmentDate: bookingForm.appointmentDate,
          appointmentTime: bookingForm.appointmentTime,
          notes: bookingForm.notes.trim()
        })
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to book appointment');
      }

      setBookingSuccessMessage('Appointment booked! Visit your dashboard to see the confirmed slot.');
      setTimeout(() => setBookingSuccessMessage(''), 4000);
      closeBookingModal();
    } catch (error) {
      console.error('Landing booking failed:', error);
      setBookingError(error.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                BookIt
              </span>
            </div>

            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-700 py-2 hover:text-purple-600 transition">Services</a>
              <a href="#about" className="text-gray-700 py-2 hover:text-purple-600 transition">About</a>
              <a href="#testimonials" className="text-gray-700 py-2 hover:text-purple-600 transition">Testimonials</a>
              {isLoggedIn ? (
                <button
                  onClick={() => navigate(`/dashboard/${userRole}`)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition cursor-pointer"
                >
                  My Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/user/login')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition cursor-pointer"
                >
                  Login
                </button>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block text-gray-700 hover:text-purple-600">Services</a>
              <a href="#about" className="block text-gray-700 hover:text-purple-600">About</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-purple-600">Testimonials</a>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    navigate(`/dashboard/${userRole}`);
                    setMobileMenuOpen(false);
                  }}
                  className="block bg-purple-600 text-white px-6 py-2 rounded-full text-center w-full"
                >
                  My Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/user/login');
                    setMobileMenuOpen(false);
                  }}
                  className="block bg-purple-600 text-white px-6 py-2 rounded-full text-center w-full"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {bookingSuccessMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 bg-white/95 border border-purple-200 rounded-2xl px-5 py-3 shadow-2xl text-sm text-gray-800 animate-fade-in">
          <CheckCircle size={20} className="text-purple-600" />
          <div>
            <p className="font-semibold text-gray-900">{bookingSuccessMessage}</p>
            <p className="text-xs text-gray-500">It will be visible under Dashboard → Appointments right away.</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Book Your
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Perfect </span>
              Appointment
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Schedule seamlessly with our intuitive booking system. Get instant confirmation and reminders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleBookNow} className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition transform hover:scale-105 flex items-center justify-center gap-2">
                Book Appointment <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#services" className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition">
                Learn More
              </a>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Daily Bookings</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-purple-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Our Services</h2>
          <p className="text-gray-600 text-center mb-12">Choose the perfect service for your needs</p>

          {servicesLoading ? (
            <div className="text-center text-gray-600">Loading services...</div>
          ) : servicesError ? (
            <div className="text-center text-red-600">{servicesError}</div>
          ) : availableServices.length === 0 ? (
            <div className="text-center text-gray-600">No services available right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {availableServices.map((service) => (
                <div key={service.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.category || 'General Service'}</p>
                  <p className="text-3xl font-bold text-purple-600 mb-3">${Number(service.price || 0).toFixed(2)}</p>
                  {Array.isArray(service.availabilitySummary) && service.availabilitySummary.length > 0 && (
                    <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">Available</p>
                      <div className="space-y-1">
                        {service.availabilitySummary.map((line, index) => (
                          <p key={`${service.id}-availability-${index}`} className="text-xs font-medium text-emerald-700">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleBookNow}
                    className="w-full bg-purple-600 text-white py-3 rounded-full hover:bg-purple-700 transition"
                  >
                    Select Service
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 text-center mb-12">Don't just take our word for it</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold">BookIt</span>
          </div>
          <p className="text-gray-400 mb-4">Making appointments simple and seamless</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Contact</a>
          </div>
          <p className="text-gray-500 mt-8">© 2025 BookIt. All rights reserved.</p>
        </div>
      </footer>

      {bookingModalOpen && (
        <BookingModal
          user={user}
          availableServices={availableServices}
          servicesLoading={servicesLoading}
          servicesError={servicesError}
          bookingForm={bookingForm}
          bookingErrors={bookingErrors}
          bookingError={bookingError}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          setSelectedDate={setSelectedDate}
          setSelectedTime={setSelectedTime}
          setBookingForm={setBookingForm}
          closeBookingModal={closeBookingModal}
          handleBookingSubmit={handleBookingSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

const BookingModal = ({
  user,
  availableServices,
  servicesLoading,
  servicesError,
  bookingForm,
  bookingErrors,
  bookingError,
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
  setBookingForm,
  closeBookingModal,
  handleBookingSubmit,
  isSubmitting
}) => {
  const selectedService = availableServices.find((service) => service.id === bookingForm.serviceId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh] border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book a Service</h2>
            <p className="text-sm text-gray-500 mt-1">This booking is tied to your dashboard appointments.</p>
          </div>
          <button onClick={closeBookingModal} className="text-gray-500 hover:text-gray-900 transition">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {bookingError && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {bookingError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase font-semibold text-gray-500">Full Name</label>
              <input
                type="text"
                value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                readOnly
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-gray-500">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-gray-500">Phone</label>
              <input
                type="text"
                value={user?.mobile || user?.phone || ''}
                readOnly
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-semibold text-gray-500">Service</label>
            {servicesLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500">
                Loading services...
              </div>
            ) : servicesError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
                {servicesError}
              </div>
            ) : availableServices.length === 0 ? (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-700">
                No available services right now.
              </div>
            ) : (
              <select
                value={bookingForm.serviceId}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, serviceId: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              >
                <option value="">Choose a service</option>
                {availableServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} · ${Number(service.price).toFixed(2)}
                    {service.category ? ` (${service.category})` : ''}
                  </option>
                ))}
              </select>
            )}
            {bookingErrors.serviceId && <p className="text-xs text-red-500 mt-1">{bookingErrors.serviceId}</p>}
          </div>

          {selectedService && (
            <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-700">
              {selectedService.description || 'You will be charged at checkout based on this service.'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs uppercase font-semibold mx-2 text-gray-500">Select Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setBookingForm((prev) => ({
                    ...prev,
                    appointmentDate: toDateOnlyString(date)
                  }));
                }}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 focus:border-purple-500"
              />
              {bookingErrors.appointmentDate && (
                <p className="text-xs text-red-500 mt-1">{bookingErrors.appointmentDate}</p>
              )}
            </div>
            <div>
              <label className="text-xs uppercase font-semibold mx-2 text-gray-500">Select Time</label>
              <DatePicker
                selected={selectedTime}
                onChange={(time) => {
                  setSelectedTime(time);
                  setBookingForm((prev) => ({
                    ...prev,
                    appointmentTime: time
                      ? time.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                      : ''
                  }));
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 focus:border-purple-500"
              />
              {bookingErrors.appointmentTime && (
                <p className="text-xs text-red-500 mt-1">{bookingErrors.appointmentTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-semibold text-gray-500">Notes (optional)</label>
            <textarea
              rows={3}
              value={bookingForm.notes}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes or preferences for the team"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            onClick={closeBookingModal}
          >
            Cancel
          </button>
          <button
            onClick={handleBookingSubmit}
            disabled={isSubmitting || servicesLoading || availableServices.length === 0}
            className="px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-60 hover:shadow-lg transition flex items-center gap-2"
          >
            {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};
