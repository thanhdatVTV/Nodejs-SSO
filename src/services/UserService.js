const { db } = require('../firebase.js');

async function getList(req, res) {
    try {
        // Parse query parameters
        const { keyword, pageNumber = 1, perPage = 10 } = req.query;


        // Ensure pageNumber and perPage are parsed as integers
        const parsedPageNumber = parseInt(pageNumber);
        const parsedPerPage = parseInt(perPage);

        let UsersRef = db.collection('tbl_User');

        // Apply keyword filter if provided
        if (keyword) {
            UsersRef = UsersRef.where('UserName', '==', keyword); // Replace "fieldName" with the actual field name
        }

        // Add filter condition to exclude documents where isDelete is true
        UsersRef = UsersRef.where('IsDelete', '!=', true);

        // Calculate the starting index based on parsedPageNumber and parsedPerPage
        const startIndex = (parsedPageNumber - 1) * parsedPerPage;

        // Fetch a page of documents
        const snapshot = await UsersRef.limit(parsedPerPage).offset(startIndex).get();

        if (snapshot.empty) {
            const resultViewModel = {
                status: -1,
                message: 'No documents found',
                response: null,
                totalRecord: 0
            };
            return res.status(404).send(resultViewModel);
        }

        const Users = [];
        snapshot.forEach((doc) => {
            Users.push({
                id: doc.id,
                data: doc.data(),
            });
        });

        const resultViewModel = {
            status: 1,
            message: 'success',
            response: Users,
            totalRecord: Users.length // You might need to adjust this depending on your actual total record count
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

async function addUser(req, res) {
    try {
        const { UserName, PassWord, Type } = req.body;

        // Check if MaGV already exists
        const existingLecturer = await db.collection('tbl_User').where('UserName', '==', UserName).get();
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
            UserName,
            PassWord,
            Type,
            IsDelete: false,
        };

        const docRef = await db.collection('tbl_User').add(UserData);

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

async function updateUser(req, res) {
    try {
        const { Id, UserName, PassWord, Type } = req.body;

        const UsersRef = db.collection('tbl_User').doc(Id);

        // Check if the document exists
        const doc = await UsersRef.get();
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
        await UsersRef.update({
            UserName,
            PassWord,
            Type
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

async function deleteUser(req, res) {
    try {
        const { Id } = req.body;

        const UsersRef = db.collection('tbl_User').doc(Id);

        // Check if the document exists
        const doc = await UsersRef.get();
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
        await UsersRef.update({
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

async function checkUser(req, res) {
    try {
        const { UserName, PassWord } = req.query;
        let resultViewModel = {}; // Khởi tạo resultViewModel
        // Query the Firestore collection 'tbl_User' to find the user
        const userSnapshot = await db.collection('tbl_User').where('UserName', '==', UserName).where('PassWord', '==', PassWord).get();

        if (userSnapshot.empty) {
            // Tài khoản không tồn tại trong hệ thống
            resultViewModel = {
                status: 0,
                message: "Tài khoản không tồn tại trong hệ thống!",
                response: null,
                totalRecord: 0
            };
        } else {
            const userData = userSnapshot.docs[0].data();
            const userId = userSnapshot.docs[0].id; // Lấy ID của người dùng
            const userType = parseInt(userData.Type);
            console.log('a', userType);
            let userInfoViewModel = null;
            if (userType === 0) {
                console.log('a1', userType);
                // Query student data
                const studentSnapshot = await db.collection('tbl_Student').where('UserId', '==', userId).get();

                if (!studentSnapshot.empty) {
                    const studentData = studentSnapshot.docs[0].data();
                    // Query major data based on MajorId
                    const majorSnapshot = await db.collection('tbl_Major').doc(studentData.MajorId).get();
                    if (majorSnapshot.exists) {
                        const majorData = majorSnapshot.data();
                        userInfoViewModel = {
                            LastName: studentData.LastName,
                            FirstName: studentData.FirstName,
                            FullName: studentData.FullName,
                            DateOfBirth: studentData.DateOfBirth,
                            StudentId: studentData.StudentId,
                            MajorId: studentData.MajorId,
                            MajorName: majorData.MajorName,
                            Type: 0
                        };
                    } else {
                        // Handle case when major information is not found
                        // For example, set facultyName to null or other default value
                        userInfoViewModel = {
                            LastName: studentData.LastName,
                            FirstName: studentData.FirstName,
                            FullName: studentData.FullName,
                            DateOfBirth: studentData.DateOfBirth,
                            StudentId: studentData.StudentId,
                            MajorId: null,
                            FacultyName: null,
                            Type: 0
                        };
                    }
                }
            } else if (userType === 1) {
                console.log('a2', userType);
                // Query teacher data
                const teacherSnapshot = await db.collection('tbl_Teacher').where('UserId', '==', userId).get();

                if (!teacherSnapshot.empty) {
                    const teacherData = teacherSnapshot.docs[0].data();
                    // Tiếp tục xử lý dữ liệu giáo viên
                    // Query faculty data based on FacultyId
                    const facultySnapshot = await db.collection('tbl_Faculty').doc(teacherData.FacultyId).get();
                    if (facultySnapshot.exists) {
                        const facultyData = facultySnapshot.data();
                        userInfoViewModel = {
                            LastName: teacherData.LastName,
                            FirstName: teacherData.FirstName,
                            FullName: teacherData.FullName,
                            DateOfBirth: teacherData.DateOfBirth,
                            TeacherId: teacherData.TeacherId,
                            FacultyId: teacherData.FacultyId,
                            FacultyName: facultyData.FacultyName,
                            Type: 1
                        };
                    } else {
                        // Handle case when faculty information is not found
                        // For example, set facultyName to null or other default value
                        userInfoViewModel = {
                            LastName: teacherData.LastName,
                            FirstName: teacherData.FirstName,
                            FullName: teacherData.FullName,
                            DateOfBirth: teacherData.DateOfBirth,
                            TeacherId: teacherData.TeacherId,
                            FacultyId: null,
                            FacultyName: null,
                            Type: 1
                        };
                    }
                }
            }

            // Tài khoản chính xác
            resultViewModel = {
                status: 1,
                message: "Tài khoản chính xác!",
                response: userInfoViewModel,
                totalRecord: userInfoViewModel ? 1 : 0
            };
        }

        res.status(200).send(resultViewModel);
    } catch (error) {
        console.error('Error checking user: ', error);
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
    addUser,
    updateUser,
    deleteUser,
    checkUser
};
