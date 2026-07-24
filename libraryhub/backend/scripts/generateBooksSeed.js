/**
 * Generates data/booksSeed.js — 72 engineering-focused books, unique Open Library covers.
 * Run: node scripts/generateBooksSeed.js
 */
const fs = require("fs");
const path = require("path");

const RAW = [
  ["Programming", "Clean Code", "Robert C. Martin", "9780132350884", 2008, "A handbook of agile software craftsmanship for writing readable, maintainable code."],
  ["Programming", "The Pragmatic Programmer", "David Thomas", "9780135957059", 2019, "Classic guide to becoming a better programmer and software craftsman."],
  ["Programming", "Design Patterns", "Gang of Four", "9780201633610", 1994, "Elements of reusable object-oriented software design patterns."],
  ["Programming", "Refactoring", "Martin Fowler", "9780134757599", 2018, "Improving the design of existing code through systematic refactoring."],
  ["Programming", "Head First Java", "Kathy Sierra", "9780596009208", 2005, "Brain-friendly introduction to Java programming fundamentals."],
  ["Programming", "Effective Java", "Joshua Bloch", "9780134685991", 2017, "Best practices for the Java programming language."],
  ["Programming", "JavaScript: The Good Parts", "Douglas Crockford", "9780596517747", 2008, "Essential JavaScript patterns and features to use and avoid."],
  ["Programming", "You Don't Know JS Yet", "Kyle Simpson", "9781098142480", 2020, "Deep dive into the core mechanisms of JavaScript."],
  ["Programming", "Python Crash Course", "Eric Matthes", "9781593279288", 2019, "Hands-on project-based introduction to Python programming."],
  ["Programming", "Fluent Python", "Luciano Ramalho", "9781492056354", 2021, "Clear and powerful Pythonic code for intermediate developers."],
  ["Programming", "C Programming Language", "Kernighan & Ritchie", "9780131103627", 1988, "Definitive reference for the C programming language."],
  ["Programming", "Structure and Interpretation", "Abelson & Sussman", "9780262510875", 1996, "Foundational computer science using Scheme."],
  ["Programming", "Code Complete", "Steve McConnell", "9780735619678", 2004, "Practical handbook of software construction best practices."],
  ["Programming", "Introduction to Algorithms", "Cormen et al.", "9780262046305", 2022, "Comprehensive algorithms textbook for CS students."],
  ["Programming", "Compilers: Principles", "Aho, Lam, Sethi", "9781292024340", 2013, "Dragon book on compiler design and implementation."],
  ["Programming", "Operating System Concepts", "Silberschatz", "9781119800361", 2021, "Classic OS textbook covering processes, memory, and files."],
  ["Programming", "Computer Networking: A Top-Down", "Kurose & Ross", "9780136681557", 2021, "Networking from applications down to physical layer."],
  ["Science", "Physics for Scientists", "Serway & Jewett", "9781337553278", 2018, "Calculus-based physics for engineering majors."],
  ["Science", "Fundamentals of Physics", "Halliday & Resnick", "9781118230718", 2013, "Introductory physics with engineering applications."],
  ["Science", "Chemistry: The Central Science", "Brown et al.", "9780134414233", 2017, "General chemistry for science and engineering students."],
  ["Science", "Organic Chemistry", "Paula Bruice", "9780134042282", 2016, "Organic chemistry with biological and industrial context."],
  ["Science", "Biology", "Campbell & Reece", "9780134093413", 2017, "Comprehensive biology for university science programs."],
  ["Science", "Engineering Mechanics: Statics", "Hibbeler", "9780133918922", 2015, "Statics and equilibrium for mechanical engineering."],
  ["Science", "Engineering Mechanics: Dynamics", "Hibbeler", "9780133910919", 2015, "Dynamics, kinematics, and kinetics for engineers."],
  ["Science", "Materials Science and Engineering", "Callister", "9781118324578", 2013, "Structure and properties of engineering materials."],
  ["Science", "Thermodynamics: An Engineering Approach", "Cengel & Boles", "9780073398174", 2014, "Thermodynamics principles for mechanical engineers."],
  ["Science", "Fluid Mechanics", "Frank M. White", "9780073398273", 2015, "Fluid mechanics fundamentals and applications."],
  ["Science", "Electric Circuits", "Nilsson & Riedel", "9780134746968", 2018, "Circuit analysis for electrical engineering students."],
  ["Mathematics", "Calculus: Early Transcendentals", "James Stewart", "9781285741550", 2015, "Calculus textbook widely used in engineering programs."],
  ["Mathematics", "Linear Algebra and Its Applications", "David Lay", "9780321982384", 2015, "Linear algebra with applications to engineering."],
  ["Mathematics", "Discrete Mathematics", "Kenneth Rosen", "9780134689525", 2018, "Discrete math for computer science and engineering."],
  ["Mathematics", "Probability and Statistics", "Walpole et al.", "9780134114217", 2016, "Probability and statistics for engineers and scientists."],
  ["Mathematics", "Advanced Engineering Mathematics", "Erwin Kreyszig", "9780470458365", 2011, "Mathematical methods for engineering students."],
  ["Mathematics", "Numerical Methods", "Burden & Faires", "9781305253667", 2016, "Numerical analysis for scientific computing."],
  ["Mathematics", "Differential Equations", "Boyce & DiPrima", "9781119386053", 2017, "Ordinary differential equations with applications."],
  ["Mathematics", "Complex Variables", "Brown & Churchill", "9780073383170", 2013, "Complex analysis for engineering mathematics."],
  ["History", "A Short History of Nearly Everything", "Bill Bryson", "9780767908184", 2003, "Accessible history of science discoveries."],
  ["History", "The Innovators", "Walter Isaacson", "9781476708706", 2014, "History of the digital revolution and computing pioneers."],
  ["History", "Hidden Figures", "Margot Lee Shetterly", "9780062363602", 2016, "NASA mathematicians who powered the space race."],
  ["History", "The Code Book", "Simon Singh", "9780385495325", 1999, "History of codes and cryptography."],
  ["History", "Alan Turing: The Enigma", "Andrew Hodges", "9780691164724", 2014, "Biography of Alan Turing and computing history."],
  ["History", "The Soul of a New Machine", "Tracy Kidder", "9780316491976", 1981, "Engineering team building a minicomputer."],
  ["Literature", "Brave New World", "Aldous Huxley", "9780060850524", 2006, "Dystopian classic exploring technology and society."],
  ["Literature", "1984", "George Orwell", "9780451524935", 1950, "Political dystopia with themes of surveillance."],
  ["Literature", "Frankenstein", "Mary Shelley", "9780141439471", 2003, "Early science fiction on creation and responsibility."],
  ["Literature", "The Martian", "Andy Weir", "9780553418026", 2014, "Engineering survival story on Mars."],
  ["Literature", "Project Hail Mary", "Andy Weir", "9780593135204", 2021, "Science-driven space adventure novel."],
  ["Literature", "Ready Player One", "Ernest Cline", "9780307887443", 2011, "Virtual reality and gaming culture novel."],
  ["AI", "Artificial Intelligence: A Modern Approach", "Russell & Norvig", "9780134610993", 2020, "Leading AI textbook covering search, ML, and robotics."],
  ["AI", "Deep Learning", "Goodfellow, Bengio, Courville", "9780262035613", 2016, "Foundational deep learning theory and practice."],
  ["AI", "Hands-On Machine Learning", "Aurélien Géron", "9781098125970", 2022, "Practical ML with Scikit-Learn, Keras, and TensorFlow."],
  ["AI", "Pattern Recognition and ML", "Christopher Bishop", "9780387310732", 2006, "Probabilistic perspective on machine learning."],
  ["AI", "Speech and Language Processing", "Jurafsky & Martin", "9780131873216", 2008, "NLP fundamentals for text and speech systems."],
  ["AI", "Reinforcement Learning", "Sutton & Barto", "9780262039246", 2018, "Introduction to reinforcement learning algorithms."],
  ["AI", "Generative Deep Learning", "David Foster", "9781098149224", 2022, "Building autoencoders, GANs, and transformers."],
  ["AI", "AI Engineering", "Chip Huyen", "9781098166306", 2024, "Building production machine learning systems."],
  ["Networking", "Computer Networks", "Andrew Tanenbaum", "9780132126953", 2010, "Comprehensive computer networks textbook."],
  ["Networking", "TCP/IP Illustrated Vol 1", "W. Richard Stevens", "9780321336316", 2011, "Deep dive into TCP/IP protocol implementation."],
  ["Networking", "Network Security Essentials", "William Stallings", "9780134527338", 2016, "Cryptography and network security fundamentals."],
  ["Networking", "Routing TCP/IP Vol 1", "Jeff Doyle", "9781578700417", 1998, "IP routing protocols for network engineers."],
  ["Networking", "HTTP: The Definitive Guide", "David Gourley", "9781565925090", 2002, "HTTP protocol and web architecture reference."],
  ["Networking", "High Performance Browser Networking", "Ilya Grigorik", "9781449372637", 2013, "Web performance and networking for developers."],
  ["Networking", "DNS and BIND", "Cricket Liu", "9780596100575", 2006, "DNS administration and configuration guide."],
  ["Networking", "Wireless Communications", "Andrea Goldsmith", "9780521837163", 2005, "Wireless channel models and communication theory."],
  ["Database", "Database System Concepts", "Silberschatz", "9780078022159", 2019, "Core database theory and SQL for CS students."],
  ["Database", "Fundamentals of Database Systems", "Elmasri & Navathe", "9780133970777", 2015, "Relational model, normalization, and SQL."],
  ["Database", "Designing Data-Intensive Applications", "Martin Kleppmann", "9781449373320", 2017, "Scalable data systems architecture patterns."],
  ["Database", "SQL Performance Explained", "Markus Winand", "9783950307825", 2012, "Indexing and tuning for SQL databases."],
  ["Database", "MySQL Explained", "Andrew Comeau", "9781987543721", 2018, "Practical MySQL for developers and students."],
  ["Database", "NoSQL Distilled", "Pramod Sadalage", "9780321826626", 2012, "Overview of NoSQL databases and use cases."],
  ["Database", "Redis in Action", "Josiah Carlson", "9781617290855", 2013, "In-memory data structures and caching patterns."],
  ["Database", "MongoDB: The Definitive Guide", "Kristina Chodorow", "9781449381554", 2013, "Document database design and operations."],
  ["Programming", "React Up and Running", "Stoyan Stefanov", "9781491931820", 2016, "Building web UIs with React and modern JavaScript."],
  ["Programming", "Node.js Design Patterns", "Mario Casciaro", "9781839214110", 2020, "Scalable Node.js application architecture."],
  ["Programming", "Docker Deep Dive", "Nigel Poulton", "9781916585250", 2020, "Containerization with Docker for developers."],
  ["Programming", "Kubernetes Up and Running", "Kelsey Hightower", "9781492046530", 2017, "Orchestrating containers in production."],
];

function cover(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

const books = RAW.map((row, i) => {
  const [category, title, author, isbn, publicationYear, description] = row;
  const id = `BK${String(i + 1).padStart(4, "0")}`;
  const copies = 3 + (i % 5);
  return {
    bookId: id,
    title,
    author,
    category,
    isbn,
    publicationYear,
    description,
    coverImage: cover(isbn),
    totalCopies: copies,
    availableCopies: copies,
    shelfLocation: `${category.slice(0, 3).toUpperCase()}-${String((i % 20) + 1).padStart(2, "0")}`,
  };
});

const out = `/** Auto-generated — ${books.length} engineering books, unique ISBN covers */\nmodule.exports = ${JSON.stringify(books, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, "..", "data", "booksSeed.js"), out, "utf8");
console.log(`Wrote ${books.length} books to data/booksSeed.js`);

