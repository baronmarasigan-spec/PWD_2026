import React from 'react';
import { User } from '../types';
import { QRCodeSVG } from 'qrcode.react';

interface IDCardProps {
  user: User;
  side?: 'front' | 'back';
}

export const IDCard: React.FC<IDCardProps> = ({ user, side = 'front' }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).toUpperCase();
    } catch (e) {
      return dateStr.toUpperCase();
    }
  };

  const pwdId = user.pwdIdNumber || (user.id?.startsWith('GGG-') ? user.id : '13-7405-000-00000');

  const fullName = (() => {
    if (user.firstName || user.lastName) {
      const parts = [
        user.firstName,
        user.middleName,
        user.lastName,
        user.suffix
      ].filter(Boolean);
      return parts.join(' ').toUpperCase();
    }
    return (user.name || 'JUAN DELA CRUZ').toUpperCase();
  })();

  if (side === 'back') {
    return (
      <div className="w-[500px] h-[310px] bg-[#F7F6F5] rounded-xl shadow-2xl overflow-hidden relative flex flex-col font-sans select-none border border-slate-300 p-5">
        {/* Faded monument background watermark on the right side - made larger & more visible */}
        <div 
          className="absolute right-4 top-4 bottom-[46px] w-[280px] opacity-[0.40] pointer-events-none bg-contain bg-right bg-no-repeat z-0"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dx20khqe5/image/upload/v1779695708/Gemini_Generated_Image_y5oioxy5oioxy5oi_m4tzb0.png')` }}
        />

        {/* Back Header: QR code on top-right */}
        <div className="flex items-center justify-between relative z-10 mb-3 -mt-3.5">
          <div className="w-[64px] shrink-0"></div>

          <div className="flex-1 flex justify-center">
            <img 
              src="https://res.cloudinary.com/dx20khqe5/image/upload/v1779695709/id_img_back_logo_jvk9ml.png" 
              alt="PWD Back Logo" 
              className="h-9 w-auto object-contain grayscale"
              style={{ filter: 'grayscale(100%)' }}
            />
          </div>

          {/* Top-Right QR Code */}
          <div className="bg-white border-2 border-slate-950 rounded-lg p-1 shadow-sm shrink-0">
            <QRCodeSVG 
              value={`https://pwdconnect.sanjuan.gov.ph/verify/${pwdId}`}
              size={54}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Address and Emergency Contact Lines */}
        <div className="space-y-3 pl-3 pr-2 relative z-10">
          {/* Address Line */}
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5 w-full">
              <span className="text-[12px] font-serif font-black text-slate-900 shrink-0 uppercase tracking-tight">Address:</span>
              <span className="flex-1 text-[12.5px] font-serif text-[#CE2029] border-b border-stone-400 pb-0.5 leading-tight uppercase font-bold min-h-[16px]">
                {user.address || 'SAN JUAN CITY, METRO MANILA'}
              </span>
            </div>
          </div>

          <div className="h-1"></div>

          {/* Emergency Title */}
          <h3 className="text-[12.5px] font-serif font-black text-slate-950 uppercase tracking-tight leading-none mb-1">
            IN CASE OF EMERGENCY PLEASE NOTIFY
          </h3>

          {/* Parent/Guardian Line */}
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5 w-full">
              <span className="text-[12px] font-serif font-black text-slate-900 shrink-0 uppercase tracking-tight">Parent/Guardian:</span>
              <span className="flex-1 text-[12.5px] font-serif text-[#CE2029] border-b border-stone-400 pb-0.5 leading-tight uppercase font-bold min-h-[16px]">
                {user.emergencyContactPerson || 'N/A'}
              </span>
            </div>
          </div>

          {/* Contact No. Line */}
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5 w-full">
              <span className="text-[12px] font-serif font-black text-slate-900 shrink-0 uppercase tracking-tight">Contact No.:</span>
              <span className="flex-1 text-[12.5px] font-serif text-[#CE2029] border-b border-stone-400 pb-0.5 leading-tight uppercase font-bold min-h-[16px]">
                {user.emergencyContactNumber || user.contactNumber || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section - Dark brown/charcoal strip */}
        <div className="mt-auto flex flex-col -mx-5 -mb-5 bg-[#262322] px-4 py-2.5 items-center justify-center text-center border-t border-slate-700/50 relative z-10">
          <p className="text-[7.5px] text-stone-200/95 leading-normal max-w-[460px] text-center italic tracking-normal font-serif">
            The holder of this card is a person with disability and is entitled to all benefits and privileges in accordance with <br /> Republic Acts 9442 and 10754. Non-Transferrable. Valid for (5) years. Any violation is punishable by law.
          </p>
          <p className="text-[9.5px] font-sans font-black text-white tracking-[0.1em] uppercase leading-none mt-1">
            VALID ANYWHERE IN THE PHILIPPINES
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[500px] h-[310px] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col font-sans select-none border border-slate-300">
      {/* Full Front Background facade building */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none z-0" 
        style={{ 
          backgroundImage: `url('https://res.cloudinary.com/dx20khqe5/image/upload/v1779695706/San-Juan-City-facade-640x480_bjte30.webp')`,
          backgroundPosition: 'center center'
        }}
      />
      {/* 60% white overlay on top of the background image */}
      <div className="absolute inset-0 bg-white/60 pointer-events-none z-0"></div>
      
      {/* Top Header - Transparent Section with Logos */}
      <div className="bg-transparent px-4 py-2 flex items-center justify-between z-10 shrink-0">
        <img 
          src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
          alt="San Juan Seal" 
          className="h-11 w-11 object-contain shrink-0"
        />
        <div className="text-center flex-1 mx-3">
          <h4 className="text-[8px] font-bold text-slate-900 uppercase tracking-widest leading-tight font-serif">
            REPUBLIC OF THE PHILIPPINES
          </h4>
          <h1 className="text-[19px] font-black text-[#cb1c1d] uppercase tracking-[0.16em] leading-none my-0.5 font-sans scale-y-105">
            CITY OF SAN JUAN
          </h1>
          <h2 className="text-[9px] font-bold text-slate-850 uppercase tracking-tight leading-none font-serif mt-0.5">
            Persons with Disability Affairs Office
          </h2>
        </div>
        <img 
          src="https://res.cloudinary.com/dx20khqe5/image/upload/v1779758063/Makabagong_San_Juan_logo_l7azpb.png" 
          alt="Makabagong San Juan Logo" 
          className="h-12 w-auto object-contain shrink-0"
        />
      </div>

      {/* Red Horizontal Accent Bar with Citizen's Name */}
      <div className="h-[28px] bg-[#cb1c1d] w-full z-10 shrink-0 shadow-sm flex items-center justify-center px-4">
        <span className="text-white text-[16px] font-sans font-black tracking-[0.15em] uppercase text-center leading-none">
          {fullName}
        </span>
      </div>

      {/* Main Details Section */}
      <div className="flex-1 relative flex z-10 overflow-hidden bg-transparent">
        {/* Content columns */}
        <div className="relative z-10 flex w-full pt-2.5 pb-4 px-4 gap-3">
          {/* Left Column: ID Fields + Mayor Signature */}
          <div className="flex-1 flex flex-col">
            <div className="space-y-1.5 pt-0">
              {/* ID Number Row */}
              <div className="flex items-baseline gap-1.5 text-slate-950 font-serif leading-none">
                <span className="text-[13.5px] font-bold text-slate-900 whitespace-nowrap">ID Number:</span>
                <span className="text-[14px] font-bold text-[#CE2029] tracking-tight uppercase">
                  {pwdId}
                </span>
              </div>

              {/* Classified Row */}
              <div className="flex items-baseline gap-1.5 text-slate-950 font-serif leading-none">
                <span className="text-[13.5px] font-bold text-slate-900 whitespace-nowrap">Classified:</span>
                <span className="text-[13.5px] font-bold text-[#CE2029] uppercase">
                  {user.disabilityType || 'ORTHOPEDIC'}
                </span>
              </div>

              {/* Birthday Row */}
              <div className="flex items-baseline gap-1.5 text-slate-950 font-serif leading-none">
                <span className="text-[13.5px] font-bold text-slate-900 whitespace-nowrap">Birthday:</span>
                <span className="text-[13.5px] font-bold text-[#CE2029] uppercase">
                  {formatDate(user.birthDate)}
                </span>
              </div>

              {/* Sex Row */}
              <div className="flex items-baseline gap-1.5 text-slate-950 font-serif leading-none">
                <span className="text-[13.5px] font-bold text-slate-900 whitespace-nowrap">Sex:</span>
                <span className="text-[13.5px] font-bold text-[#CE2029] uppercase">
                  {user.sex || user.gender || 'MALE'}
                </span>
              </div>

              {/* Blood Type Row */}
              <div className="flex items-baseline gap-1.5 text-slate-950 font-serif leading-none">
                <span className="text-[13.5px] font-bold text-slate-900 whitespace-nowrap">Blood Type:</span>
                <span className="text-[13.5px] font-bold text-[#CE2029] uppercase">
                  {user.bloodType || 'O+'}
                </span>
              </div>

              {/* Date Issued Row */}
              <div className="flex items-baseline gap-1.5 text-slate-950 font-serif leading-none">
                <span className="text-[13px] font-bold text-slate-900 whitespace-nowrap">DATE ISSUED:</span>
                <span className="text-[13px] font-bold text-[#CE2029] uppercase">
                  {formatDate(user.pwdIdIssueDate) || formatDate(user.registrationDate) || formatDate('2026-05-20')}
                </span>
              </div>

              {/* Valid Until Row */}
              <div className="flex items-baseline gap-1.5 text-slate-950 font-serif leading-none">
                <span className="text-[13px] font-bold text-slate-900 whitespace-nowrap">VALID UNTIL:</span>
                <span className="text-[13px] font-bold text-[#CE2029] uppercase">
                  {formatDate(user.pwdIdExpiryDate) || formatDate('2031-05-20')}
                </span>
              </div>
            </div>

            {/* Bottom Signature area of the Mayor at lower-left */}
            <div className="mt-auto pl-1 flex flex-col justify-end items-center self-start select-none">
              <div className="relative -mb-2 h-9 flex items-center justify-center">
                {/* Mayor Zamora's signature visual image overlay */}
                <img 
                  src="https://res.cloudinary.com/dx20khqe5/image/upload/v1779773197/ChatGPT_Image_May_26_2026_01_26_19_PM_dmg09h.png" 
                  alt="Mayor Zamora Signature" 
                  className="h-9 w-auto object-contain pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h5 className="text-[9px] font-sans font-black text-slate-900 tracking-tight leading-none uppercase shrink-0 text-center">
                HON. FRANCISCO JAVIER M. ZAMORA
              </h5>
              <p className="text-[6.5px] font-sans font-extrabold text-slate-700 tracking-wider uppercase leading-none mt-0.5 shrink-0 text-center">
                MAYOR
              </p>
            </div>
          </div>

          {/* Right Column: User Portrait Photo with neat border */}
          <div className="w-[108px] shrink-0 flex flex-col justify-center items-end self-center pr-1 select-none z-10">
            <div className="w-[100px] h-[100px] bg-slate-50/50 rounded-lg p-0.5 border border-slate-400 shadow-sm overflow-hidden flex items-center justify-center">
              <img 
                src={user.avatarUrl || 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png'} 
                alt="ID Portrait" 
                className="w-full h-full object-cover rounded shadow-inner" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blue Accent Bar #212056 in the upper of Makabagong San Juan */}
      <div className="h-[4px] bg-[#212056] w-full shrink-0 relative z-10"></div>

      {/* Bottom Red Strip with text “MAKABAGONG SAN JUAN” */}
      <div className="mt-auto h-[24px] bg-[#cb1c1d] py-1.5 flex items-center justify-center shrink-0 relative z-10">
        <p className="text-white font-black text-[10.5px] font-sans uppercase tracking-[0.38em] text-center leading-none">
          MAKABAGONG SAN JUAN
        </p>
      </div>
    </div>
  );
};
