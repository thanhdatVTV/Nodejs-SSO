const { db } = require('../firebase.js');

async function getList(req, res) {
    try {
        // Parse query parameters
        const { keyword, pageNumber = 1, perPage = 10 } = req.query;


        // Ensure pageNumber and perPage are parsed as integers
        const parsedPageNumber = parseInt(pageNumber);
        const parsedPerPage = parseInt(perPage);

        let TeachersRef = db.collection('tbl_Teacher');

        // Apply keyword filter if provided
        if (keyword) {
            TeachersRef = TeachersRef.where('FullName', '==', keyword); // Replace "fieldName" with the actual field name
        }

        // Add filter condition to exclude documents where isDelete is true
        TeachersRef = TeachersRef.where('IsDelete', '!=', true);

        // Calculate the starting index based on parsedPageNumber and parsedPerPage
        const startIndex = (parsedPageNumber - 1) * parsedPerPage;

        // Fetch a page of documents
        const snapshot = await TeachersRef.limit(parsedPerPage).offset(startIndex).get();

        if (snapshot.empty) {
            const resultViewModel = {
                status: -1,
                message: 'No documents found',
                response: null,
                totalRecord: 0
            };
            return res.status(404).send(resultViewModel);
        }

        const Teachers = [];
        snapshot.forEach((doc) => {
            Teachers.push({
                id: doc.id,
                data: doc.data(),
            });
        });

        const resultViewModel = {
            status: 1,
            message: 'success',
            response: Teachers,
            totalRecord: Teachers.length // You might need to adjust this depending on your actual total record count
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

async function addTeacher(req, res) {
    try {
        const { UserId, TeacherId, LastName, FirstName, DateOfBirth, FacultyId } = req.body;

        // Check if TeacherId already exists
        const existingLecturer = await db.collection('tbl_Teacher').where('TeacherId', '==', TeacherId).get();
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
            TeacherId,
            LastName,
            FirstName,
            FullName: LastName + ' ' + FirstName,
            DateOfBirth,
            FacultyId,
            IsDelete: false,
        };

        const docRef = await db.collection('tbl_Teacher').add(UserData);

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

async function updateTeacher(req, res) {
    try {
        const { Id, UserId, TeacherId, LastName, FirstName, DateOfBirth, FacultyId } = req.body;

        const TeachersRef = db.collection('tbl_Teacher').doc(Id);

        // Check if the document exists
        const doc = await TeachersRef.get();
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
        await TeachersRef.update({
            UserId,
            TeacherId,
            LastName,
            FirstName,
            DateOfBirth,
            FacultyId
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

async function deleteTeacher(req, res) {
    try {
        const { Id } = req.body;

        const TeachersRef = db.collection('tbl_Teacher').doc(Id);

        // Check if the document exists
        const doc = await TeachersRef.get();
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
        await TeachersRef.update({
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
    addTeacher,
    updateTeacher,
    deleteTeacher
};
