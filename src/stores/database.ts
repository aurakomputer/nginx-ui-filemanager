import { defineStore, acceptHMRUpdate } from "pinia";
import { cloneDeep } from "lodash";
import { api } from "../utils/api";

export interface Student {
  id: number | string;
  name: string;
  id_number?: string;
  school_class?: SchoolClass;
  [key: string]: unknown;
}

export interface SchoolClass {
  id: number | string;
  name: string;
  students: Student[];
  [key: string]: unknown;
}

export interface LearningHour {
  id: number | string;
  name?: string;
  [key: string]: unknown;
}

export interface AttendanceRecord {
  id?: number | string;
  student_id: number | string;
  [key: string]: unknown;
}

export interface LearningSubject {
  id?: number | string;
  [key: string]: unknown;
}

export interface DatabaseState {
  lastSync: string | null;
  schoolClasses: SchoolClass[];
  learningHours: LearningHour[];
  attendances: AttendanceRecord[];
  learningSubjects: LearningSubject[];
  showLoading: boolean;
  loading: boolean;
  currentSyncTitle: string | null;
  currentSyncProgress: number | null;
}

const formatTimestampId = (date: Date): string => {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const useDatabaseStore = defineStore("database", {
  state: (): DatabaseState => ({
    lastSync: null,
    schoolClasses: [],
    learningHours: [],
    attendances: [],
    learningSubjects: [],
    showLoading: false,
    loading: false,
    currentSyncTitle: null,
    currentSyncProgress: null,
  }),

  getters: {
    students(state): Student[] {
      let students: Student[] = [];

      for (const schoolClass of state.schoolClasses) {
        let _students = cloneDeep(schoolClass.students || []);

        _students = _students.map((_student) => {
          _student.school_class = cloneDeep(schoolClass);
          return _student;
        });

        students = [...students, ..._students];
      }

      return students;
    },
  },

  actions: {
    reset(): void {
      this.lastSync = null;
      this.schoolClasses = [];
      this.learningHours = [];
      this.attendances = [];
      this.learningSubjects = [];
    },

    async syncSchoolClass(): Promise<void> {
      this.loading = true;
      this.currentSyncTitle = "Mengambil data kelas";
      try {
        const response = (await api.get("v1/school-classes")) as unknown as {
          data: { schoolClasses: SchoolClass[] };
        };
        this.schoolClasses = response.data.schoolClasses;
      } finally {
        this.loading = false;
      }
    },

    async syncLearningHours(): Promise<void> {
      this.loading = true;
      this.currentSyncTitle = "Mengambil data mata pelajaran";
      try {
        const response = (await api.get("v1/learning-hours")) as unknown as {
          data: { learningHours: LearningHour[] };
        };
        this.learningHours = response.data.learningHours;
      } finally {
        this.loading = false;
      }
    },

    async syncAttendances(): Promise<void> {
      this.loading = true;
      this.currentSyncTitle = "Sinkronasi data absensi";
      try {
        const response = (await api.post("v1/student-attendance/sync", {
          attendances: this.attendances,
        })) as unknown as {
          data: { attendances: AttendanceRecord[] };
        };
        this.attendances = response.data.attendances;
      } finally {
        this.loading = false;
      }
    },

    async syncLearningSubjects(): Promise<void> {
      this.loading = true;
      this.currentSyncTitle = "Sinkronasi data materi pembelajaran";
      try {
        const response = (await api.post("v1/learning-subjects/sync", {
          learning_subjects: this.learningSubjects,
        })) as unknown as {
          data: { learning_subjects: LearningSubject[] };
        };
        this.learningSubjects = response.data.learning_subjects;
      } finally {
        this.loading = false;
      }
    },

    async sync(showLoading = true): Promise<void> {
      this.showLoading = showLoading;

      if (navigator.onLine) {
        await this.syncSchoolClass();
        await this.syncLearningHours();
        await this.syncAttendances();
        await this.syncLearningSubjects();

        this.lastSync = formatTimestampId(new Date());
      }

      this.currentSyncTitle = null;
    },
  },

  persist: true,
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDatabaseStore, import.meta.hot));
}
