import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Timestamp = bigint;
export type EventId = bigint;
export interface Event {
    title: string;
    date: Timestamp;
    description: string;
    subjectId?: SubjectId;
    eventType: EventType;
}
export type AttendanceId = bigint;
export type StudentId = bigint;
export type Course = string;
export interface StudentProfile {
    id: StudentId;
    name: string;
    year: bigint;
    email: string;
    address: string;
    phone: string;
    course: string;
    avatar?: ExternalBlob;
}
export interface Record_ {
    day: bigint;
    month: bigint;
    isPresent: boolean;
    date: Timestamp;
    year: bigint;
    subjectId: SubjectId;
}
export type NotificationId = bigint;
export interface Notification {
    title: string;
    userId: Principal;
    notificationType: NotificationType;
    createdAt: Timestamp;
    isRead: boolean;
    message: string;
    relatedItemId?: bigint;
}
export interface Message {
    isGroupMessage: boolean;
    isRead: boolean;
    toUserId: Principal;
    fromUserId: Principal;
    message: string;
    timestamp: Timestamp;
}
export type AssignmentId = bigint;
export interface Assignment {
    isSubmitted: boolean;
    title: string;
    dueDate: Timestamp;
    submittedAt?: Timestamp;
    description: string;
    subjectId: SubjectId;
}
export interface Subject {
    totalMarks: bigint;
    professorName: string;
    isCompleted: boolean;
    marksObtained: bigint;
    practicalDate: Timestamp;
    name: string;
    year: bigint;
    attendancePercent: bigint;
    examDate: Timestamp;
    course: Course;
}
export type SubjectId = bigint;
export enum EventType {
    assignment = "assignment",
    exam = "exam",
    event = "event"
}
export enum NotificationType {
    warning = "warning",
    info = "info",
    success = "success"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAssignment(assignment: Assignment): Promise<AssignmentId>;
    createEvent(event: Event): Promise<EventId>;
    createNotification(notification: Notification): Promise<NotificationId>;
    createSubject(subject: Subject): Promise<SubjectId>;
    getAllAssignments(): Promise<Array<Assignment>>;
    getAllSubjects(): Promise<Array<Subject>>;
    getAssignmentsForSubject(subjectId: SubjectId): Promise<Array<Assignment>>;
    getAttendanceHistory(subjectId: SubjectId): Promise<Array<Record_>>;
    getCallerProfile(): Promise<StudentProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversations(): Promise<Array<Principal>>;
    getEvents(month: bigint, year: bigint): Promise<Array<Event>>;
    getEventsForMonth(month: bigint, year: bigint): Promise<Array<Event>>;
    getMessagesWithUser(otherUserId: Principal): Promise<Array<Message>>;
    getNotifications(): Promise<Array<Notification>>;
    getProfile(studentId: StudentId): Promise<StudentProfile | null>;
    getSubject(id: SubjectId): Promise<Subject | null>;
    getUserProfile(user: Principal): Promise<StudentProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAllNotificationsRead(): Promise<void>;
    markNotificationRead(id: NotificationId): Promise<void>;
    markSubjectComplete(subjectId: SubjectId): Promise<void>;
    recordAttendance(record: Record_): Promise<AttendanceId>;
    registerOrUpdateProfile(newProfile: StudentProfile): Promise<StudentId>;
    saveCallerUserProfile(profile: StudentProfile): Promise<void>;
    sendMessage(toUserId: Principal, message: string): Promise<void>;
    submitAssignment(id: AssignmentId): Promise<void>;
}
