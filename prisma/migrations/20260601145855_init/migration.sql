-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "majors" TEXT[],
    "minors" TEXT[],

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);
