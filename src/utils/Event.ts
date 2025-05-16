import {storage} from './storage'; // MMKV instance

export interface EventRecord {
  taskId: string;
  isHeadless: boolean;
  timestamp: string;
  status: string;
  message?: string;
}

export default class Event {
  taskId: string;
  isHeadless: boolean;
  timestamp: string;
  key: string;
  status: string;
  message?: string;

  constructor(
    taskId: string,
    isHeadless: boolean,
    timestamp?: string,
    status: string = 'executed',
    message?: string,
  ) {
    if (!timestamp) {
      const now: Date = new Date();
      timestamp = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    }

    this.taskId = taskId;
    this.isHeadless = isHeadless;
    this.timestamp = timestamp;
    this.status = status;
    this.message = message;
    this.key = `${this.taskId}-${this.timestamp}`;
  }

  static destroyAll() {
    storage.set('events', JSON.stringify([]));
  }

  static async create(
    taskId: string,
    isHeadless: boolean,
    status: string = 'executed',
    message?: string,
  ) {
    const event = new Event(taskId, isHeadless, undefined, status, message);

    try {
      const json = storage.getString('events');
      const data = json ? JSON.parse(json) : [];
      data.push(event.toJson());
      storage.set('events', JSON.stringify(data));
    } catch (error) {
      console.error('Event.create error: ', error);
    }

    return event;
  }

  static async all(): Promise<Event[]> {
    try {
      const json = storage.getString('events');
      const data = json ? JSON.parse(json) : [];

      return data.map((record: any) => {
        return new Event(
          record.taskId,
          record.isHeadless,
          record.timestamp,
          record.status,
          record.message,
        );
      });
    } catch (error) {
      console.error('Event.all error: ', error);
      return [];
    }
  }

  toJson(): EventRecord {
    return {
      taskId: this.taskId,
      timestamp: this.timestamp,
      isHeadless: this.isHeadless,
      status: this.status,
      message: this.message,
    };
  }
}
