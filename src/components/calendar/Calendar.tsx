"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  DateClickArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/utils/supabase/client";
import { Trash2, Loader2, Plus, Download, Calendar as CalendarIcon, Clock, Edit3, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const supabase = createClient();

interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    calendar: string;
    description?: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("Primary");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Day view modal state (when clicking a date on the calendar)
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [dayEventsModalOpen, setDayEventsModalOpen] = useState<boolean>(false);
  const [dayEventsList, setDayEventsList] = useState<CalendarEvent[]>([]);

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Primary: "primary",
    Success: "success",
    Warning: "warning",
    Danger: "danger",
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Format Date object to "YYYY-MM-DDTHH:mm" for datetime-local input
  const formatDateTimeLocal = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;

      const mappedEvents: CalendarEvent[] = (data || []).map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        start: ev.start_time,
        end: ev.end_time,
        allDay: false,
        extendedProps: {
          calendar: ev.event_level || "Primary",
          description: ev.description || "",
        },
      }));

      setEvents(mappedEvents);
    } catch (err: any) {
      console.error("Error fetching calendar events:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Shared logic: open the day events modal for a given date
  const openDayEventsModal = (dateStr: string) => {
    const clickedDateStr = dateStr.split("T")[0]; // YYYY-MM-DD
    setSelectedDateStr(clickedDateStr);

    // Filter events that fall on this clicked date
    const matchedEvents = events.filter((ev) => {
      const evStart = ev.start.split("T")[0];
      const evEnd = ev.end ? ev.end.split("T")[0] : evStart;
      return clickedDateStr >= evStart && clickedDateStr <= evEnd;
    });

    setDayEventsList(matchedEvents);
    setDayEventsModalOpen(true);
  };

  // When selecting/dragging a date range on the calendar
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    openDayEventsModal(selectInfo.startStr);
  };

  // When tapping/clicking directly on a day cell (works reliably on mobile)
  const handleDateClick = (clickInfo: DateClickArg) => {
    openDayEventsModal(clickInfo.dateStr);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr || event.startStr,
      extendedProps: {
        calendar: event.extendedProps?.calendar || "Primary",
        description: event.extendedProps?.description || "",
      },
    });

    setEventTitle(event.title);
    setEventStartDate(
      event.start ? formatDateTimeLocal(new Date(event.start)) : ""
    );
    setEventEndDate(
      event.end ? formatDateTimeLocal(new Date(event.end)) : (event.start ? formatDateTimeLocal(new Date(event.start)) : "")
    );
    setEventLevel(event.extendedProps?.calendar || "Primary");
    setDayEventsModalOpen(false); // Close day modal if open
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle.trim()) {
      alert("Please enter an event title.");
      return;
    }
    if (!eventStartDate || !eventEndDate) {
      alert("Please select both a start and end time.");
      return;
    }

    try {
      setIsSaving(true);
      const startISO = new Date(eventStartDate).toISOString();
      const endISO = new Date(eventEndDate).toISOString();

      if (selectedEvent) {
        // Update in Supabase
        const { error } = await supabase
          .from("calendar_events")
          .update({
            title: eventTitle,
            start_time: startISO,
            end_time: endISO,
            event_level: eventLevel,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedEvent.id);

        if (error) throw error;
      } else {
        // Insert into Supabase
        const { error } = await supabase.from("calendar_events").insert([
          {
            title: eventTitle,
            start_time: startISO,
            end_time: endISO,
            event_level: eventLevel,
          },
        ]);

        if (error) throw error;
      }

      await fetchEvents();
      closeModal();
      resetModalFields();
    } catch (err: any) {
      alert("Failed to save event: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!confirm(`Delete event "${selectedEvent.title}"?`)) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", selectedEvent.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      closeModal();
      resetModalFields();
    } catch (err: any) {
      alert("Failed to delete event: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("Primary");
    setSelectedEvent(null);
  };

  // Generate and Download PDF for the selected day's events
  const handleGenerateDayPDF = () => {
    if (dayEventsList.length === 0) {
      alert("No events found for this day to generate PDF.");
      return;
    }

    const doc = new jsPDF();

    // Brand Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text("PREMIER AUTO HUB", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Daily Schedule & Events Report", 14, 29);

    // Date Header Box
    doc.setDrawColor(220, 225, 230);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 35, 182, 18, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Report Date: ${selectedDateStr}`, 18, 46);
    doc.text(`Total Events: ${dayEventsList.length}`, 130, 46);

    // Format table data
    const tableRows = dayEventsList.map((ev, index) => {
      const startTime = new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const category = ev.extendedProps?.calendar || "Primary";
      return [
        index + 1,
        ev.title,
        `${startTime} - ${endTime}`,
        category
      ];
    });

    autoTable(doc, {
      startY: 58,
      head: [["#", "Event Title", "Time Slot", "Category"]],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
      bodyStyles: { textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 5 },
    });

    // Footer info
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Premier Auto Hub Admin Portal`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save(`Schedule_${selectedDateStr}.pdf`);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          events={events}
          selectable={true}
          selectMirror={true}
          selectMinDistance={0}
          selectLongPressDelay={0}
          longPressDelay={0}
          eventLongPressDelay={0}
          select={handleDateSelect}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          dayMaxEvents={true}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: () => {
                resetModalFields();
                const now = new Date();
                const startStr = formatDateTimeLocal(now);
                now.setHours(now.getHours() + 1);
                const endStr = formatDateTimeLocal(now);

                setEventStartDate(startStr);
                setEventEndDate(endStr);
                openModal();
              },
            },
          }}
        />
      </div>

      {/* Day Events Viewable Modal */}
      <Modal
        isOpen={dayEventsModalOpen}
        onClose={() => setDayEventsModalOpen(false)}
        className="max-w-[650px] p-6 lg:p-8"
      >
        <div className="flex flex-col overflow-y-auto px-1">
          {/* Header with Top-Left Add Event button & Top Generate PDF button */}
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 pr-12 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                  Events for {selectedDateStr}
                </h5>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {dayEventsList.length} {dayEventsList.length === 1 ? "event" : "events"} scheduled on this date.
              </p>
            </div>

            <div className="flex items-center gap-2.5 sm:mt-0 mt-3">
              {/* Top Left / Action: Add Event Button */}
              <button
                type="button"
                onClick={() => {
                  setDayEventsModalOpen(false);
                  resetModalFields();
                  const baseDate = selectedDateStr ? new Date(selectedDateStr + "T09:00:00") : new Date();
                  const startStr = formatDateTimeLocal(baseDate);
                  baseDate.setHours(baseDate.getHours() + 1);
                  const endStr = formatDateTimeLocal(baseDate);

                  setEventStartDate(startStr);
                  setEventEndDate(endStr);
                  openModal();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Event
              </button>

              {/* Generate & Download PDF Button */}
              <button
                type="button"
                onClick={handleGenerateDayPDF}
                disabled={dayEventsList.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                Generate PDF
              </button>
            </div>
          </div>

          {/* Events List for this Day */}
          <div className="mt-5 space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {dayEventsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-3 text-gray-400 dark:bg-gray-800">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                  No events scheduled for this day.
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  Click "Add Event" above to schedule something for {selectedDateStr}.
                </p>
              </div>
            ) : (
              dayEventsList.map((ev) => {
                const startTime = new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTime = new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const category = ev.extendedProps?.calendar || "Primary";
                
                const badgeColorMap: Record<string, string> = {
                  Primary: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
                  Success: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
                  Warning: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
                  Danger: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
                };

                return (
                  <div
                    key={ev.id}
                    onClick={() => handleEventClick({ event: { id: ev.id, title: ev.title, startStr: ev.start, endStr: ev.end, extendedProps: ev.extendedProps } as any } as EventClickArg)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs transition hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/60 dark:hover:border-blue-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {ev.title}
                          </h6>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badgeColorMap[category] || badgeColorMap.Primary}`}>
                            {category}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          {startTime} - {endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition dark:text-blue-400">
                      Edit <Edit3 className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="mt-2 flex items-center justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              onClick={() => setDayEventsModalOpen(false)}
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[650px] p-6 lg:p-8"
      >
        <div className="flex flex-col overflow-y-auto px-1">
          <div>
            <h5 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
              {selectedEvent ? "Edit Event" : "Add New Event"}
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Schedule appointments, maintenance jobs, or client visits across distinct time slots.
            </p>
          </div>

          <div className="mt-6 space-y-4 text-xs">
            {/* Event Title */}
            <div>
              <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                Event Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Oil Change - WP CAD-1234"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Event Level / Category Color */}
            <div>
              <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
                Event Category
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {Object.entries(calendarsEvents).map(([key, value]) => (
                  <label
                    key={key}
                    htmlFor={`modal${key}`}
                    className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="radio"
                      name="event-level"
                      value={key}
                      id={`modal${key}`}
                      checked={eventLevel === key}
                      onChange={() => setEventLevel(key)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Slot Inputs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            {selectedEvent ? (
              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={isDeleting || isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete Event"}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={closeModal}
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                disabled={isSaving || isDeleting}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {selectedEvent ? "Update Event" : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const level = (eventInfo.event.extendedProps?.calendar || "Primary").toLowerCase();
  
  const levelColorMap: Record<string, string> = {
    primary: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    warning: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    danger: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  };

  const badgeClass = levelColorMap[level] || levelColorMap.primary;

  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded border px-1.5 py-0.5 text-[11px] leading-tight shadow-2xs ${badgeClass}`}
    >
      {eventInfo.timeText && (
        <span className="font-semibold opacity-90">{eventInfo.timeText}</span>
      )}
      <span className="truncate font-medium">{eventInfo.event.title}</span>
    </div>
  );
};

export default Calendar;