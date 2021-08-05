import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import moment from "moment";
import { getId } from "nicks-gun-utils";

const repeat = n => Array.apply(null, Array(n));

export const Calendar = ({
  id,
  calendar,
  onCreateEvent,
  onSetCalendarTitle,
  onUpdateEvent
}) => {
  const [editing, setEditing] = useState(false);
  const [newCalendarTitle, setNewCalendarTitle] = useState("");
  const [week, setWeek] = useState(moment().startOf("week"));

  return (
    <DragDropContext
      onDragEnd={({ source, destination, draggableId }) => {
        if (!destination || source.droppableId === destination.droppableId) {
          return;
        }

        onUpdateEvent(draggableId, "start", Number(destination.droppableId));
      }}
    >
      <div className="calendar">
        {editing ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              onSetCalendarTitle(newCalendarTitle);
              setEditing(false);
            }}
          >
            <input
              autoFocus
              value={newCalendarTitle}
              onChange={e => setNewCalendarTitle(e.target.value)}
              placeholder="calendar title"
            />
          </form>
        ) : (
          <h1
            onDoubleClick={e => {
              setNewCalendarTitle(calendar.title);
              setEditing(true);
            }}
            className="calendar-title"
          >
            {(calendar && calendar.title) || id}
          </h1>
        )}
        <div className="calendar-content">
          <div className="calendar-nav">
            <button
              onClick={() =>
                setWeek(
                  moment(week)
                    .subtract(1, "week")
                    .startOf("week")
                )
              }
            >
              &lt;
            </button>
            <button
              onClick={() =>
                setWeek(
                  moment(week)
                    .add(1, "week")
                    .startOf("week")
                )
              }
            >
              &gt;
            </button>
            <div className="month">{moment(week).format("MMMM")}</div>
            <div className="year">{moment(week).format("YYYY")}</div>
          </div>
          <div className="days">
            <div className="days-titles">
              {repeat(7).map((_, i) => {
                const day = moment(week).add(i, "days");
                return (
                  <div key={day.valueOf()} className="day-title">
                    <div className="day-day">{day.format("ddd")}</div>
                    <div className="day-date">{day.format("D")}</div>
                  </div>
                );
              })}
            </div>
            <div className="days-hours">
              {repeat(7).map((_, i) => {
                const day = moment(week).add(i, "days");
                return (
                  <Day
                    key={day.valueOf()}
                    index={i}
                    day={day}
                    calendar={calendar}
                    onCreateEvent={onCreateEvent}
                    onUpdateEvent={onUpdateEvent}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

const Day = ({ day, calendar, onCreateEvent, onUpdateEvent }) => {
  return (
    <div className="day">
      {repeat(24).map((_, i) => {
        const hour = moment(day).add(i, "hour");
        return (
          <Hour
            key={hour.valueOf()}
            hour={hour}
            calendar={calendar}
            index={i}
            onCreateEvent={onCreateEvent}
            onUpdateEvent={onUpdateEvent}
          />
        );
      })}
    </div>
  );
};

const Hour = ({ hour, calendar, onCreateEvent, onUpdateEvent }) => {
  const id = getId(hour);
  const [addingNewEvent, setAddingNewEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const events = calendar.events.filter(
    e =>
      hour <= moment(e.start) && moment(e.start) < moment(hour).add(1, "hour")
  );
  return (
    <div
      className="hour"
      onDoubleClick={() => !addingNewEvent && setAddingNewEvent(true)}
    >
      {addingNewEvent && (
        <div className="new-event">
          <form
            onSubmit={e => {
              e.preventDefault();
              onCreateEvent(hour.valueOf(), newEventTitle);
              setAddingNewEvent(false);
              setNewEventTitle("");
            }}
          >
            <input
              autoFocus
              onKeyDown={e => {
                console.log(e.keyCode);
                if (e.keyCode === 27) {
                  setAddingNewEvent(false);
                }
              }}
              value={newEventTitle}
              onChange={e => setNewEventTitle(e.target.value)}
              placeholder="new event"
            />
          </form>
        </div>
      )}
      <Droppable
        droppableId={`${hour.valueOf()}`}
        type="HOUR"
        direction="horizontal"
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className="events"
            {...provided.droppableProps}
          >
            {events.map((event, i) => (
              <Event
                key={getId(event)}
                event={event}
                onUpdateEvent={onUpdateEvent}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {!moment(hour).day() && (
        <div className="hour-label">{hour.format("HH:mm")}</div>
      )}
    </div>
  );
};

const Event = ({ index, event, onUpdateEvent }) => {
  const id = getId(event);
  const [editing, setEditing] = useState();
  const [eventTitle, setEventTitle] = useState(event.title);
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          className="event"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onDoubleClick={e => {
            e.stopPropagation();
            setEventTitle(event.title);
            setEditing(true);
          }}
        >
          {editing ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                onUpdateEvent(id, "title", eventTitle);
                setEditing(false);
              }}
            >
              <input
                autoFocus
                value={eventTitle}
                onChange={e => setEventTitle(e.target.value)}
                placeholder="event title"
              />
            </form>
          ) : (
            <div className="event-title">{event.title || "No title"}</div>
          )}
        </div>
      )}
    </Draggable>
  );
};
