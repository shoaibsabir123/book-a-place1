import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, Headphones, FileText, ArrowLeft } from 'lucide-react';

interface StaticPageProps {
  page: 'cancellation-policy' | 'terms' | 'privacy' | 'about' | 'help';
  onBack: () => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ page, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Stays
      </button>

      {page === 'cancellation-policy' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900">Cancellation & Refund Policy</h2>
            <p className="text-xs text-slate-500 mt-1">Book a Place Pakistan Standard Hospitality Terms</p>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900">1. Flexible Cancellation Policy (Standard Listings)</h3>
            <p>
              Guests may cancel free of charge up to 24 hours prior to standard check-in time (14:00 PKT on check-in day). A 100% refund of the room rate and cleaning fees will be processed back to the original payment method (Easypaisa, JazzCash, or Bank Account) within 2 to 4 business days.
            </p>

            <h3 className="font-bold text-sm text-slate-900">2. Long-Stay & Student Accommodation Packages</h3>
            <p>
              For monthly rentals and semester stays exceeding 28 days: cancellation requires 7 days advance notice prior to the start of the billing period to release the inventory hold.
            </p>

            <h3 className="font-bold text-sm text-slate-900">3. Security Deposit Processing</h3>
            <p>
              Refundable security deposits are immediately unblocked or returned upon physical check-out inspection by the host.
            </p>
          </div>
        </div>
      )}

      {page === 'terms' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900">Guest Terms of Service</h2>
            <p className="text-xs text-slate-500 mt-1">Applicable to all verified accommodation bookings in Pakistan</p>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900">1. Verification & Identity</h3>
            <p>
              In accordance with the regulatory directives of the Government of Pakistan and local hospitality laws, every guest checking in must present their original National Identity Card (CNIC) or foreign Passport. Hosts reserve the right to decline entry without valid ID.
            </p>

            <h3 className="font-bold text-sm text-slate-900">2. House Rules & Noise Curfew</h3>
            <p>
              Guests agree to respect neighborhood quiet hours (strictly between 23:00 and 07:00 PKT in residential sectors such as Islamabad F/E sectors, Lahore Gulberg/DHA, and Karachi Clifton).
            </p>

            <h3 className="font-bold text-sm text-slate-900">3. Power & Internet Standards</h3>
            <p>
              Listings marked with "24/7 Power Backup" guarantee automatic generator or solar UPS transition during municipal loadshedding cycles.
            </p>
          </div>
        </div>
      )}

      {page === 'privacy' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900">Privacy & Data Protection</h2>
            <p className="text-xs text-slate-500 mt-1">How Book a Place protects your personal information</p>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <p>
              We enforce PostgreSQL Row Level Security (RLS) on all user profile, booking, and payment records. Your government CNIC and payment account details are encrypted and accessible only for authorized identity verification.
            </p>
          </div>
        </div>
      )}

      {(page === 'about' || page === 'help') && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900">24/7 Guest Support & About Us</h2>
            <p className="text-xs text-slate-500 mt-1">Book a Place Pakistan Support Team</p>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <p>
              Book a Place is Pakistan’s leading AI-powered marketplace connecting travelers, university students, and corporate professionals with vetted, verified accommodations.
            </p>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950">
              <p className="font-bold">Contact Helpline (Urdu / English):</p>
              <p className="font-mono text-sm mt-1">+92 51 111 266 575</p>
              <p className="mt-1">Email: support@bookaplace.pk</p>
              <p className="mt-1">Headquarters: Blue Area, Islamabad, Pakistan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
