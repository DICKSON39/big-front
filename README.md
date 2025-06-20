I have these getStudents():Observable<any[]>{

    return this.http.get<any[]>(`${this.apiUrl}/students`, {

      headers:this.getAuthHeaders()

    })

  }



  getEnrolledStudents():Observable<any[]>{

    return this.http.get<any>(`${this.apiUrl}/enrolled/student`,{

      headers:this.getAuthHeaders()



    })

  }



  getStudentWithTheirCourses():Observable<any[]>{

    return this.http.get<any>(`${this.apiUrl}/enrolled/courses`,{

      headers:this.getAuthHeaders()



    })

  } what is the best way to displayy whatever comes from the I want when the Teacher in teacher dashboard presses student he gets a component that will show the students and the enrolled students and the one enrolled in acourse