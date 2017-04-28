import { User } from '../index';

export class Classroom {
    _id: string;
    roomName: string;
    teacherId: string;
    students: User[];
    pendingReq: User[];
}