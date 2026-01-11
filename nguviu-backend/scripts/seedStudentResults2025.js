import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Result from '../models/Result.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nguviu';

// Student data from KCSE Merit List Form 4A 2025
const studentsData = [
  {
    admissionNumber: '64121',
    indexNumber: '248',
    name: 'IBRAHIM S. KOISE',
    dateOfBirth: '2008-05-15', // May 15, 2008
    kcpeMarks: 346,
    stream: 'C',
    email: 'ibrahim.koise@student.nguviu.ac.ke',
    phone: '0712000001',
    results: {
      ENG: { grade: 'B-', points: 8 },
      KISW: { grade: 'A-', points: 11 },
      MAT: { grade: 'A-', points: 11 },
      BIO: { grade: 'A-', points: 11 },
      PHY: { grade: 'B+', points: 10 },
      CHEM: { grade: 'A', points: 12 },
      CRE: { grade: 'B+', points: 10 },
      'B/ST': { grade: 'A', points: 12 },
      'A.G.P': { grade: 'A-', points: 11 }
    }
  },
  {
    admissionNumber: '62191',
    indexNumber: '87',
    name: 'BARIU J. GAKII',
    dateOfBirth: '2008-03-22', // March 22, 2008
    kcpeMarks: 370,
    stream: 'C',
    email: 'bariu.gakii@student.nguviu.ac.ke',
    phone: '0712000002',
    results: {
      ENG: { grade: 'B', points: 9 },
      KISW: { grade: 'A', points: 12 },
      MAT: { grade: 'B-', points: 8 },
      BIO: { grade: 'C+', points: 7 },
      CHEM: { grade: 'B', points: 9 },
      GEO: { grade: 'A-', points: 11 },
      CRE: { grade: 'B+', points: 10 },
      FRE: { grade: 'B', points: 9 },
      'A.G.P': { grade: 'B+', points: 10 }
    }
  },
  {
    admissionNumber: '62521',
    indexNumber: '117',
    name: 'HILDA MUKAMI',
    dateOfBirth: '2008-08-10', // August 10, 2008
    kcpeMarks: 348,
    stream: 'C',
    email: 'hilda.mukami@student.nguviu.ac.ke',
    phone: '0712000003',
    results: {
      ENG: { grade: 'B-', points: 8 },
      KISW: { grade: 'B+', points: 10 },
      MAT: { grade: 'A', points: 12 },
      BIO: { grade: 'B', points: 9 },
      CHEM: { grade: 'B', points: 9 },
      GEO: { grade: 'A-', points: 11 },
      CRE: { grade: 'B-', points: 8 },
      'B/ST': { grade: 'A', points: 12 },
      'A.G.P': { grade: 'B+', points: 10 }
    }
  },
  {
    admissionNumber: '62711',
    indexNumber: '135',
    name: 'NDUATI P. NYOKABI',
    dateOfBirth: '2008-11-05', // November 5, 2008
    kcpeMarks: 357,
    stream: 'C',
    email: 'nduati.nyokabi@student.nguviu.ac.ke',
    phone: '0712000004',
    results: {
      ENG: { grade: 'C+', points: 7 },
      KISW: { grade: 'B+', points: 10 },
      MAT: { grade: 'B+', points: 10 },
      BIO: { grade: 'A-', points: 11 },
      CHEM: { grade: 'B', points: 9 },
      HIST: { grade: 'C+', points: 7 },
      CRE: { grade: 'A-', points: 11 },
      AGR: { grade: 'A-', points: 11 },
      'A.G.P': { grade: 'B+', points: 10 }
    }
  },
  {
    admissionNumber: '62861',
    indexNumber: '150',
    name: 'CHRISTINE N. IRERI',
    dateOfBirth: '2008-01-18', // January 18, 2008
    kcpeMarks: 375,
    stream: 'C',
    email: 'christine.ireri@student.nguviu.ac.ke',
    phone: '0712000005',
    results: {
      ENG: { grade: 'B+', points: 10 },
      KISW: { grade: 'B+', points: 10 },
      MAT: { grade: 'B-', points: 8 },
      BIO: { grade: 'A-', points: 11 },
      CHEM: { grade: 'B+', points: 10 },
      GEO: { grade: 'A-', points: 11 },
      CRE: { grade: 'B', points: 9 },
      COMP: { grade: 'B', points: 9 },
      'A.G.P': { grade: 'B+', points: 10 }
    }
  }
];

// Default password for all students
const DEFAULT_PASSWORD = 'Nguviu2025!';

async function seedStudentResults() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📝 Creating student accounts and results...\n');

    const createdUsers = [];

    for (const studentData of studentsData) {
      // Check if user already exists
      let user = await User.findOne({ email: studentData.email });

      if (!user) {
        // Create user account
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        
        user = new User({
          email: studentData.email,
          passwordHash: hashedPassword,
          role: 'student',
          name: studentData.name,
          admissionNumber: studentData.admissionNumber,
          dateOfBirth: studentData.dateOfBirth,
          phone: studentData.phone,
          stream: studentData.stream,
          isActive: true
        });

        await user.save();
        console.log(`✅ Created user: ${studentData.name}`);
      } else {
        console.log(`⚠️  User already exists: ${studentData.name}`);
      }

      // Calculate total points and mean grade
      const subjects = Object.entries(studentData.results);
      const totalPoints = subjects.reduce((sum, [_, subject]) => sum + subject.points, 0);
      const meanGrade = calculateMeanGrade(totalPoints / subjects.length);

      // Check if result already exists
      let result = await Result.findOne({
        studentId: user._id,
        term: 'Term 3',
        year: 2025,
        examType: 'Final Exam'
      });

      if (!result) {
        // Calculate total marks and average
        const subjectsArray = subjects.map(([name, data]) => ({
          subjectName: name,
          marks: data.points * 8.33, // Convert points (1-12) to marks (0-100)
          grade: data.grade,
          remarks: ''
        }));

        const totalMarks = subjectsArray.reduce((sum, subject) => sum + subject.marks, 0);
        const averageMarks = totalMarks / subjectsArray.length;

        // Create student result
        result = new Result({
          studentId: user._id,
          admissionNumber: studentData.admissionNumber,
          studentName: studentData.name,
          class: 'Form 4A',
          stream: studentData.stream,
          curriculum: '8-4-4',
          term: 'Term 3',
          year: 2025,
          examType: 'Final Exam',
          subjects: subjectsArray,
          totalMarks: Math.round(totalMarks),
          averageMarks: Math.round(averageMarks * 10) / 10,
          overallGrade: meanGrade,
          position: 0, // Will be calculated later
          outOf: 0,
          teacherRemarks: `Overall Performance: ${meanGrade}. Keep up the good work!`,
          headTeacherRemarks: 'Good academic progress demonstrated.',
          dateOfBirth: new Date(studentData.dateOfBirth),
          published: true,
          publishedDate: new Date()
        });

        await result.save();
        console.log(`✅ Created result for: ${studentData.name} - Mean Grade: ${meanGrade}`);
      } else {
        console.log(`⚠️  Result already exists for: ${studentData.name}`);
      }

      createdUsers.push({
        name: studentData.name,
        email: studentData.email,
        admissionNumber: studentData.admissionNumber,
        dateOfBirth: studentData.dateOfBirth,
        password: DEFAULT_PASSWORD,
        meanGrade
      });
    }

    // Update positions based on total marks
    console.log('\n📊 Calculating positions...');
    const allResults = await Result.find({
      year: 2025,
      term: 'Term 3',
      examType: 'Final Exam'
    }).sort({ averageMarks: -1 });

    for (let i = 0; i < allResults.length; i++) {
      allResults[i].position = i + 1;
      allResults[i].outOf = allResults.length;
      await allResults[i].save();
    }
    console.log(`✅ Updated positions for ${allResults.length} students`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 STUDENT ACCOUNTS CREATED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log('\n📋 LOGIN CREDENTIALS:\n');
    console.log('Default Password for all students: ' + DEFAULT_PASSWORD);
    console.log('\n' + '-'.repeat(80));
    
    createdUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Admission Number: ${user.admissionNumber}`);
      console.log(`   Date of Birth: ${user.dateOfBirth}`);
      console.log(`   Mean Grade: ${user.meanGrade}`);
    });

    console.log('\n' + '-'.repeat(80));
    console.log('\n💡 Students can login with their email and password');
    console.log('💡 For verification, use: Name + Admission Number + Date of Birth');
    console.log('\n✅ Seeding completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

function calculateMeanGrade(meanPoints) {
  if (meanPoints >= 12) return 'A';
  if (meanPoints >= 11) return 'A-';
  if (meanPoints >= 10) return 'B+';
  if (meanPoints >= 9) return 'B';
  if (meanPoints >= 8) return 'B-';
  if (meanPoints >= 7) return 'C+';
  if (meanPoints >= 6) return 'C';
  if (meanPoints >= 5) return 'C-';
  if (meanPoints >= 4) return 'D+';
  if (meanPoints >= 3) return 'D';
  if (meanPoints >= 2) return 'D-';
  return 'E';
}

// Run the seed function
seedStudentResults();
