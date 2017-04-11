import { User } from "../user";

export class Classroom {
    _id: string;
    namn: string;
    teacherId: string;
    students: User[];
}