import React from 'react';
import { Calendar as CalendarIcon, Clock, Video, Phone, MapPin } from 'lucide-react';

const AppointmentIndicator = ({ candidateId, appointments = [] }) => {
  // Trouver le prochain rendez-vous pour ce candidat
  const now = new Date();
  const candidateAppointments = appointments.filter(apt => apt.candidateId === candidateId);
  
  const futureAppointments = candidateAppointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
    return appointmentDateTime > now;
  });
  
  if (futureAppointments.length === 0) return null;
  
  // Trier par date et prendre le plus proche
  const nextAppointment = futureAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  })[0];
  
  const appointmentDate = new Date(`${nextAppointment.date}T${nextAppointment.time}`);
  const isToday = appointmentDate.toDateString() === now.toDateString();
  const isTomorrow = appointmentDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  
  // Déterminer la couleur et le texte selon la proximité
  let badgeColor = 'bg-blue-100 text-blue-800';
  let badgeText = '';
  
  if (isToday) {
    badgeColor = 'bg-green-100 text-green-800';
    badgeText = 'Aujourd\'hui';
  } else if (isTomorrow) {
    badgeColor = 'bg-orange-100 text-orange-800';
    badgeText = 'Demain';
  } else {
    const daysDiff = Math.ceil((appointmentDate - now) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      badgeColor = 'bg-blue-100 text-blue-800';
      badgeText = `Dans ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`;
    } else {
      badgeColor = 'bg-gray-100 text-gray-800';
      badgeText = appointmentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  }
  
  // Icône selon le type d'entretien
  const getAppointmentIcon = () => {
    switch (nextAppointment.type) {
      case 'video':
        return <Video className="w-3 h-3" />;
      case 'phone':
        return <Phone className="w-3 h-3" />;
      case 'onsite':
        return <MapPin className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
        {getAppointmentIcon()}
        <span>{badgeText}</span>
        <span className="text-xs opacity-75">{nextAppointment.time}</span>
      </div>
      {candidateAppointments.length > 1 && (
        <div className="text-xs text-gray-500">
          +{candidateAppointments.length - 1}
        </div>
      )}
    </div>
  );
};

export default AppointmentIndicator;
