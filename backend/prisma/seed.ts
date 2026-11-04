import { PrismaClient, UserRole, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for AlumniConnect...');

  // Hash password for seed users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('AdminSecure2026!', salt);
  const demoPasswordHash = await bcrypt.hash('DemoPassword2026!', salt);

  // 1. Seed System Administrator
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@alumniconnect.edu' },
    update: {},
    create: {
      email: 'admin@alumniconnect.edu',
      passwordHash: passwordHash,
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          headline: 'AlumniConnect Platform Admin',
          bio: 'Platform administration and institutional verification officer.',
          department: 'Computer Science & Engineering',
          graduationYear: 2018,
          skills: ['Platform Engineering', 'Governance', 'Cloud Architecture'],
        },
      },
    },
  });
  console.log(`✅ Admin seeded: ${adminUser.email}`);

  // 2. Seed Sample Alumni
  const alumniUser = await prisma.user.upsert({
    where: { email: 'alumni.sarah@google.com' },
    update: {},
    create: {
      email: 'alumni.sarah@google.com',
      passwordHash: demoPasswordHash,
      role: UserRole.ALUMNI,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Chen',
          headline: 'Senior Staff Software Engineer @ Google Cloud',
          bio: 'Passionate about distributed systems, cloud computing, and mentoring students.',
          department: 'Computer Science & Engineering',
          graduationYear: 2019,
          skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Python', 'System Design'],
          location: 'San Francisco, CA',
          linkedinUrl: 'https://linkedin.com/in/sarahchen-example',
          githubUrl: 'https://github.com/sarahchen-example',
          alumniProfile: {
            create: {
              currentCompany: 'Google',
              currentTitle: 'Senior Staff Software Engineer',
              industry: 'Cloud Infrastructure & Distributed Systems',
              yearsOfExperience: 6,
              willingToMentor: true,
              willingToRefer: true,
              maxMentees: 3,
              preferredContactMethod: 'Platform Messaging',
              officeLocation: 'Mountain View, CA',
            },
          },
        },
      },
    },
  });
  console.log(`✅ Alumni seeded: ${alumniUser.email}`);

  // 3. Seed Sample Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student.alex@university.edu' },
    update: {},
    create: {
      email: 'student.alex@university.edu',
      passwordHash: demoPasswordHash,
      role: UserRole.STUDENT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Rivera',
          headline: 'Undergraduate CS Junior | Aspiring Backend & Distributed Systems Engineer',
          bio: 'Building scalable backend systems and active open source contributor.',
          department: 'Computer Science & Engineering',
          graduationYear: 2026,
          skills: ['TypeScript', 'Node.js', 'NestJS', 'PostgreSQL', 'Docker'],
          location: 'Boston, MA',
          githubUrl: 'https://github.com/alexrivera-example',
          studentProfile: {
            create: {
              studentIdNumber: 'CS-2023-0491',
              expectedGraduationYear: 2026,
              currentSemester: 6,
              targetRoles: ['Backend Engineer', 'Cloud Engineer'],
              targetCompanies: ['Google', 'Stripe', 'Datadog'],
              githubUsername: 'alexrivera-example',
            },
          },
        },
      },
    },
  });
  console.log(`✅ Student seeded: ${studentUser.email}`);

  // 4. Seed Sample Opportunity
  await prisma.opportunity.create({
    data: {
      title: 'Cloud Systems Software Engineer Intern - Summer 2026',
      company: 'Google',
      location: 'Sunnyvale, CA (Hybrid)',
      type: 'INTERNSHIP',
      description: 'Join Google Cloud Systems team to design and implement next-gen distributed control planes.',
      requirements: ['Proficiency in Go, C++, or Java', 'Data structures and algorithms', 'Networking fundamentals'],
      applyUrl: 'https://careers.google.com/jobs/example-internship',
      authorId: alumniUser.id,
      isActive: true,
    },
  });
  console.log('✅ Sample opportunity seeded.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
