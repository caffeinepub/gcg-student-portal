import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Blob "mo:core/Blob";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  type StudentId = Nat;
  type SubjectId = Nat;
  type AssignmentId = Nat;
  type MessageId = Nat;
  type NotificationId = Nat;
  type AttendanceId = Nat;
  type EventId = Nat;
  type UserPrincipal = Principal;
  type Course = Text;

  module Course {
    public func compare(course1 : Course, course2 : Course) : Order.Order {
      Text.compare(course1, course2);
    };
  };

  module SubjectId {
    public func toText(id : SubjectId) : Text {
      id.toText();
    };
  };

  module AssignmentId {
    public func toText(id : AssignmentId) : Text {
      id.toText();
    };
  };

  module MessageId {
    public func toText(id : MessageId) : Text {
      id.toText();
    };
  };

  module NotificationId {
    public func toText(id : NotificationId) : Text {
      id.toText();
    };
  };

  module AttendanceId {
    public func toText(id : AttendanceId) : Text {
      id.toText();
    };
  };

  module EventId {
    public func toText(id : EventId) : Text {
      id.toText();
    };
  };

  type Timestamp = Int;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  module Subjects {
    public type Subject = {
      name : Text;
      professorName : Text;
      examDate : Timestamp;
      practicalDate : Timestamp;
      attendancePercent : Nat;
      marksObtained : Nat;
      totalMarks : Nat;
      isCompleted : Bool;
      course : Course;
      year : Nat;
    };
  };

  module Assignments {
    public type Assignment = {
      subjectId : SubjectId;
      title : Text;
      description : Text;
      dueDate : Timestamp;
      isSubmitted : Bool;
      submittedAt : ?Timestamp;
    };
  };

  module Messages {
    public type Message = {
      fromUserId : Principal;
      toUserId : Principal;
      message : Text;
      timestamp : Timestamp;
      isRead : Bool;
      isGroupMessage : Bool;
    };
  };

  module Notifications {
    public type NotificationType = { #info; #warning; #success };
    public type Notification = {
      userId : Principal;
      title : Text;
      message : Text;
      notificationType : NotificationType;
      isRead : Bool;
      createdAt : Timestamp;
      relatedItemId : ?Nat;
    };
  };

  module Attendance {
    public type Record = {
      subjectId : SubjectId;
      date : Timestamp;
      isPresent : Bool;
      month : Nat;
      day : Nat;
      year : Nat;
    };
  };

  module Events {
    public type EventType = { #exam; #assignment; #event };

    public type Event = {
      title : Text;
      eventType : EventType;
      date : Timestamp;
      subjectId : ?SubjectId;
      description : Text;
    };
  };

  let studentProfiles = Map.empty<Principal, StudentProfile>();
  public type StudentProfile = {
    id : StudentId;
    name : Text;
    email : Text;
    course : Text;
    year : Nat;
    phone : Text;
    address : Text;
    avatar : ?Storage.ExternalBlob;
  };

  var nextStudentId = 1;
  var nextAssignmentId = 1;
  var nextMessageId = 1;
  var nextNotificationId = 1;
  var nextAttendanceId = 1;
  var nextEventId = 1;

  // Per-user data storage
  let userSubjects = Map.empty<Principal, Map.Map<SubjectId, Subjects.Subject>>();
  let userAssignments = Map.empty<Principal, Map.Map<AssignmentId, Assignments.Assignment>>();
  let userNotifications = Map.empty<Principal, Map.Map<NotificationId, Notifications.Notification>>();
  let userAttendance = Map.empty<Principal, Map.Map<AttendanceId, Attendance.Record>>();
  let userEvents = Map.empty<Principal, Map.Map<EventId, Events.Event>>();
  let allMessages = Map.empty<MessageId, Messages.Message>();

  // -------------------- Student Profiles -------------------- //

  func getNextStudentId() : Nat {
    let id = nextStudentId;
    nextStudentId += 1;
    id;
  };

  public shared ({ caller }) func registerOrUpdateProfile(newProfile : StudentProfile) : async StudentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register or update profiles");
    };
    let id = switch (studentProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile = {
          id = profile.id;
          name = newProfile.name;
          email = newProfile.email;
          course = newProfile.course;
          year = newProfile.year;
          phone = newProfile.phone;
          address = newProfile.address;
          avatar = newProfile.avatar;
        };
        studentProfiles.add(caller, updatedProfile);
        profile.id;
      };
      case (null) {
        let newId = getNextStudentId();
        let newRegisteredProfile = {
          id = newId;
          name = newProfile.name;
          email = newProfile.email;
          course = newProfile.course;
          year = newProfile.year;
          phone = newProfile.phone;
          address = newProfile.address;
          avatar = newProfile.avatar;
        };
        studentProfiles.add(caller, newRegisteredProfile);
        newId;
      };
    };
    id;
  };

  public query ({ caller }) func getProfile(studentId : StudentId) : async ?StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    let profile = studentProfiles.values().toArray().find(
      func(profile) { profile.id == studentId }
    );

    switch (profile) {
      case (?p) {
        // Find the principal that owns this profile
        let ownerOpt = studentProfiles.entries().toArray().find(
          func((principal, prof)) { prof.id == studentId }
        );
        switch (ownerOpt) {
          case (?(owner, _)) {
            // Only allow viewing own profile or admin can view any profile
            if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own profile");
            };
            ?p;
          };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getCallerProfile() : async ?StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be a registered user to access profile information");
    };
    studentProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?StudentProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    studentProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : StudentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    studentProfiles.add(caller, profile);
  };

  // -------------------- Subjects -------------------- //

  func getUserSubjectsMap(user : Principal) : Map.Map<SubjectId, Subjects.Subject> {
    switch (userSubjects.get(user)) {
      case (?subjects) { subjects };
      case (null) {
        let newMap = Map.empty<SubjectId, Subjects.Subject>();
        userSubjects.add(user, newMap);
        newMap;
      };
    };
  };

  public shared ({ caller }) func createSubject(subject : Subjects.Subject) : async SubjectId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create subjects");
    };
    let subjects = getUserSubjectsMap(caller);
    let id = subjects.size() + 1;
    subjects.add(id, subject);
    id;
  };

  public query ({ caller }) func getSubject(id : SubjectId) : async ?Subjects.Subject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subjects");
    };
    let subjects = getUserSubjectsMap(caller);
    subjects.get(id);
  };

  public query ({ caller }) func getAllSubjects() : async [Subjects.Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subjects");
    };
    let subjects = getUserSubjectsMap(caller);
    subjects.values().toArray();
  };

  public shared ({ caller }) func markSubjectComplete(subjectId : SubjectId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark subjects complete");
    };
    let subjects = getUserSubjectsMap(caller);
    switch (subjects.get(subjectId)) {
      case (?subject) {
        let updated = {
          subject with isCompleted = true
        };
        subjects.add(subjectId, updated);
      };
      case (null) {
        Runtime.trap("Subject not found");
      };
    };
  };

  // -------------------- Assignments -------------------- //

  func getUserAssignmentsMap(user : Principal) : Map.Map<AssignmentId, Assignments.Assignment> {
    switch (userAssignments.get(user)) {
      case (?assignments) { assignments };
      case (null) {
        let newMap = Map.empty<AssignmentId, Assignments.Assignment>();
        userAssignments.add(user, newMap);
        newMap;
      };
    };
  };

  public shared ({ caller }) func createAssignment(assignment : Assignments.Assignment) : async AssignmentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create assignments");
    };
    let assignments = getUserAssignmentsMap(caller);
    let id = nextAssignmentId;
    nextAssignmentId += 1;
    assignments.add(id, assignment);
    id;
  };

  public query ({ caller }) func getAssignmentsForSubject(subjectId : SubjectId) : async [Assignments.Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assignments");
    };
    let assignments = getUserAssignmentsMap(caller);
    assignments.values().toArray().filter(
      func(a) { a.subjectId == subjectId }
    );
  };

  public query ({ caller }) func getAllAssignments() : async [Assignments.Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assignments");
    };
    let assignments = getUserAssignmentsMap(caller);
    assignments.values().toArray();
  };

  public shared ({ caller }) func submitAssignment(id : AssignmentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit assignments");
    };
    let assignments = getUserAssignmentsMap(caller);
    switch (assignments.get(id)) {
      case (?assignment) {
        let updated = {
          assignment with 
          isSubmitted = true;
          submittedAt = ?Time.now();
        };
        assignments.add(id, updated);
      };
      case (null) {
        Runtime.trap("Assignment not found");
      };
    };
  };

  // -------------------- Messages -------------------- //

  public shared ({ caller }) func sendMessage(toUserId : Principal, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be a registered user to send messages");
    };
    let newId = nextMessageId;
    nextMessageId += 1;
    let newMessage : Messages.Message = {
      fromUserId = caller;
      toUserId;
      message;
      timestamp = Time.now();
      isRead = false;
      isGroupMessage = false;
    };
    allMessages.add(newId, newMessage);
  };

  public query ({ caller }) func getMessagesWithUser(otherUserId : Principal) : async [Messages.Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    allMessages.values().toArray().filter(
      func(m) { 
        (m.fromUserId == caller and m.toUserId == otherUserId) or 
        (m.fromUserId == otherUserId and m.toUserId == caller) 
      }
    );
  };

  public query ({ caller }) func getConversations() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    let users = Map.empty<Principal, Bool>();
    for ((_, msg) in allMessages.entries()) {
      if (msg.fromUserId == caller) {
        users.add(msg.toUserId, true);
      };
      if (msg.toUserId == caller) {
        users.add(msg.fromUserId, true);
      };
    };
    users.keys().toArray();
  };

  // -------------------- Notifications -------------------- //

  func getUserNotificationsMap(user : Principal) : Map.Map<NotificationId, Notifications.Notification> {
    switch (userNotifications.get(user)) {
      case (?notifications) { notifications };
      case (null) {
        let newMap = Map.empty<NotificationId, Notifications.Notification>();
        userNotifications.add(user, newMap);
        newMap;
      };
    };
  };

  public shared ({ caller }) func createNotification(notification : Notifications.Notification) : async NotificationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create notifications");
    };
    let notifications = getUserNotificationsMap(caller);
    let id = nextNotificationId;
    nextNotificationId += 1;
    notifications.add(id, notification);
    id;
  };

  public query ({ caller }) func getNotifications() : async [Notifications.Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    let notifications = getUserNotificationsMap(caller);
    notifications.values().toArray();
  };

  public shared ({ caller }) func markNotificationRead(id : NotificationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    let notifications = getUserNotificationsMap(caller);
    switch (notifications.get(id)) {
      case (?notification) {
        let updated = {
          notification with isRead = true
        };
        notifications.add(id, updated);
      };
      case (null) {
        Runtime.trap("Notification not found");
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    let notifications = getUserNotificationsMap(caller);
    for ((id, notification) in notifications.entries()) {
      let updated = {
        notification with isRead = true
      };
      notifications.add(id, updated);
    };
  };

  // -------------------- Attendance -------------------- //

  func getUserAttendanceMap(user : Principal) : Map.Map<AttendanceId, Attendance.Record> {
    switch (userAttendance.get(user)) {
      case (?attendance) { attendance };
      case (null) {
        let newMap = Map.empty<AttendanceId, Attendance.Record>();
        userAttendance.add(user, newMap);
        newMap;
      };
    };
  };

  public shared ({ caller }) func recordAttendance(record : Attendance.Record) : async AttendanceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record attendance");
    };
    let attendance = getUserAttendanceMap(caller);
    let id = nextAttendanceId;
    nextAttendanceId += 1;
    attendance.add(id, record);
    id;
  };

  public query ({ caller }) func getAttendanceHistory(subjectId : SubjectId) : async [Attendance.Record] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance");
    };
    let attendance = getUserAttendanceMap(caller);
    attendance.values().toArray().filter(
      func(a) { a.subjectId == subjectId }
    );
  };

  // -------------------- Events -------------------- //

  func getUserEventsMap(user : Principal) : Map.Map<EventId, Events.Event> {
    switch (userEvents.get(user)) {
      case (?events) { events };
      case (null) {
        let newMap = Map.empty<EventId, Events.Event>();
        userEvents.add(user, newMap);
        newMap;
      };
    };
  };

  public shared ({ caller }) func createEvent(event : Events.Event) : async EventId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };
    let events = getUserEventsMap(caller);
    let id = nextEventId;
    nextEventId += 1;
    events.add(id, event);
    id;
  };

  public query ({ caller }) func getEventsForMonth(month : Nat, year : Nat) : async [Events.Event] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };
    let events = getUserEventsMap(caller);
    events.values().toArray();
  };

  public query ({ caller }) func getEvents(month : Nat, year : Nat) : async [Events.Event] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };
    let events = getUserEventsMap(caller);
    events.values().toArray();
  };

  // -------------------- Helper Functions -------------------- //

  func checkIsAuthorizedUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be a registered user to perform this action");
    };
  };
};

