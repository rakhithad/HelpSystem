import React from 'react';

const TicketList = ({ tickets }) => {
    if (!tickets || tickets.length === 0) {
        return (
            <div className="text-center text-white text-opacity-60 py-6">
                No tickets found.
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {tickets.map(ticket => (
                <div key={ticket.tid} className="bg-white bg-opacity-5 hover:bg-opacity-10 transition-all p-4 rounded-lg">
                    <div className="flex justify-between">
                        <p className="text-white font-medium">{ticket.title}</p>
                        <p className="text-white text-opacity-80 text-sm">
                            Status: {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </p>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-white text-opacity-60">
                        <span>TID: {ticket.tid}</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* Add description here */}
                    <div className="mt-2 text-sm text-white text-opacity-90">
                        <p className="mb-2">{ticket.description || 'No description provided'}</p>
                    </div>
                    <div className="mt-2 text-sm text-white text-opacity-80">
                        <p><strong>Customer:</strong> {ticket.customer.name}</p>
                        <p><strong>Engineer:</strong> {ticket.assignedSupportEngineer?.name || 'Not Assigned'}</p>
                        <p>
                            <strong>Priority:</strong>{' '}
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    ticket.priority === 'high'
                                        ? 'bg-red-500 bg-opacity-20 text-red-300'
                                        : ticket.priority === 'medium'
                                        ? 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                                        : 'bg-green-500 bg-opacity-20 text-green-300'
                                }`}
                            >
                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                        </p>
                        {ticket.review && (
                            <p><strong>Review:</strong> {ticket.review} (Rating: {ticket.rating} stars)</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TicketList;