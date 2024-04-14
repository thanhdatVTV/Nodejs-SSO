const { db } = require('../firebase.js');

async function getList(req, res) {
    try {
        // Parse query parameters
        const { keyword, pageNumber = 1, perPage = 10 } = req.query;


        // Ensure pageNumber and perPage are parsed as integers
        const parsedPageNumber = parseInt(pageNumber);
        const parsedPerPage = parseInt(perPage);

        let StudentsRef = db.collection('tbl_Student');

        // Apply keyword filter if provided
        if (keyword) {
            StudentsRef = StudentsRef.where('FullName', '==', keyword); // Replace "fieldName" with the actual field name
        }

        // Add filter condition to exclude documents where isDelete is true
        StudentsRef = StudentsRef.where('IsDelete', '!=', true);

        // Calculate the starting index based on parsedPageNumber and parsedPerPage
        const startIndex = (parsedPageNumber - 1) * parsedPerPage;

        // Fetch a page of documents
        const snapshot = await StudentsRef.limit(parsedPerPage).offset(startIndex).get();

        if (snapshot.empty) {
            const resultViewModel = {
                status: -1,
                message: 'No documents found',
                response: null,
                totalRecord: 0
            };
            return res.status(404).send(resultViewModel);
        }

        const Students = [];
        snapshot.forEach((doc) => {
            Students.push({
                id: doc.id,
                data: doc.data(),
            });
        });

        const resultViewModel = {
            status: 1,
            message: 'success',
            response: Students,
            totalRecord: Students.length // You might need to adjust this depending on your actual total record count
        };

        res.status(200).send(resultViewModel);
    } catch (error) {
        console.error('Error getting documents: ', error);
        const resultViewModel = {
            status: -1,
            message: 'Internal Server Error',
            response: null,
            totalRecord: 0
        };
        res.status(500).send(resultViewModel);
    }
}

async function addStudent(req, res) {
    try {
        const { UserId, StudentId, LastName, FirstName, DateOfBirth, MajorId } = req.body;

        // Check if StudentId already exists
        const existingLecturer = await db.collection('tbl_Student').where('StudentId', '==', StudentId).get();
        if (!existingLecturer.empty) {
            const resultViewModel = {
                status: 0,
                message: 'UserName already exists',
                response: null,
                totalRecord: 0
            };
            return res.status(200).send(resultViewModel);
        }

        const UserData = {
            UserId,
            StudentId,
            LastName,
            FirstName,
            FullName: LastName + ' ' + FirstName,
            DateOfBirth,
            MajorId,
            IsDelete: false,
        };

        const docRef = await db.collection('tbl_Student').add(UserData);

        const resultViewModel = {
            status: 1,
            message: 'added successfully',
            response: `added with ID: ${docRef.id}`,
            totalRecord: 1
        };

        res.status(201).send(resultViewModel);
    } catch (error) {
        console.error('Error adding: ', error);
        const resultViewModel = {
            status: -1,
            message: 'Internal Server Error',
            response: null,
            totalRecord: 0
        };
        res.status(500).send(resultViewModel);
    }
}

async function updateStudent(req, res) {
    try {
        const { Id, UserId, StudentId, LastName, FirstName, DateOfBirth, MajorId } = req.body;

        const StudentsRef = db.collection('tbl_Student').doc(Id);

        // Check if the document exists
        const doc = await StudentsRef.get();
        if (!doc.exists) {
            const resultViewModel = {
                status: 0,
                message: 'Document not found',
                response: null,
                totalRecord: 0
            };
            return res.status(404).send(resultViewModel);
        }

        // Update the document with the provided data
        await StudentsRef.update({
            UserId,
            StudentId,
            LastName,
            FirstName,
            DateOfBirth,
            MajorId
        });

        const resultViewModel = {
            status: 1,
            message: 'updated successfully',
            response: null,
            totalRecord: 0
        };

        res.status(200).send(resultViewModel);
    } catch (error) {
        console.error('Error updating information: ', error);
        const resultViewModel = {
            status: -1,
            message: 'Internal Server Error',
            response: null,
            totalRecord: 0
        };
        res.status(500).send(resultViewModel);
    }
}

async function deleteStudent(req, res) {
    try {
        const { Id } = req.body;

        const StudentsRef = db.collection('tbl_Student').doc(Id);

        // Check if the document exists
        const doc = await StudentsRef.get();
        if (!doc.exists) {
            const resultViewModel = {
                status: 0,
                message: 'Document not found',
                response: null,
                totalRecord: 0
            };
            return res.status(404).send(resultViewModel);
        }

        // Update the document with the provided data
        await StudentsRef.update({
            IsDelete: true,
        });

        const resultViewModel = {
            status: 1,
            message: 'information delete successfully',
            response: null,
            totalRecord: 0
        };

        res.status(200).send(resultViewModel);
    } catch (error) {
        console.error('Error delete information: ', error);
        const resultViewModel = {
            status: -1,
            message: 'Internal Server Error',
            response: null,
            totalRecord: 0
        };
        res.status(500).send(resultViewModel);
    }
}

module.exports = {
    getList,
    addStudent,
    updateStudent,
    deleteStudent
};
