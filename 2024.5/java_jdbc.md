# What

JDBC是什么？Java Database Connectivity (JDBC) is an application programming interface (API) for the Java programming language which defines how a client may access a database. 

jdbc包括两部分：接口和实现

接口来源：`java.sql.*`和`javax.sql.*`（javax是为EE准备的）

实现来源：各自数据库的具体实现，例如mysql、postgress等。

其中最重要的概念：Driver、Connection、Statement、ResultSet。

`Driver`是一个实现了 JDBC 接口的类，用于与特定数据库进行通信和连接。

`Connection`代表一个数据库连接

`Statement `是一个接口，它表示要执行的 SQL 语句的容器

`ResultSet`代表数据

# How

本次实践使用postgress数据库，以及官方的pg-jdbc jdbc实现。使用Driver、Connection、Statement、ResultSet去做数据库CRUD。

1. 添加JDBC依赖，这里使用的[pg官方gdbc](https://jdbc.postgresql.org/download/)中的maven管理进行依赖安装。

2. 安装pg：直接下的windows版本的，并且自带可视化工具pgadmin。

3. 查看文档https://jdbc.postgresql.org/documentation/use/编写代码

   发现在java  1.6之前必须使用Class.forName("org.postgresql.Driver");或者java -Djdbc.drivers=org.postgresql.Driver example.ImageViewer来加载驱动，现在不需要了。

4. 创建连接，有两种方法，一种是传入Property一种是直接在URL中写，所谓的Properties其实是集成HashTable<Object,Object>的类。

   ```java
   String url = "jdbc:postgresql://localhost/test";
   Properties props = new Properties();
   props.setProperty("user", "fred");
   props.setProperty("password", "secret");
   props.setProperty("ssl", "true");
   Connection conn = DriverManager.getConnection(url, props);
   
   String url = "jdbc:postgresql://localhost/test?user=fred&password=secret&ssl=true";
   Connection conn = DriverManager.getConnection(url);
   ```

5. 下面是一个简单的例子，首先需要再Pg里创建一张表。并添加一些数据

   ```sql
   CREATE TABLE employees ( id SERIAL PRIMARY KEY, name VARCHAR(50), age INTEGER, salary NUMERIC(10,2) );
   INSERT INTO employees (name, age, salary) VALUES ('John Doe', 30, 50000.00);
   ```

   完整的查询例子如下

   ```java
   public class PgJdbc {
       public static void main(String[] args) throws SQLException {
           Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost/postgres?user=postgres&password=000");
           Statement st = conn.createStatement();
           ResultSet rs = st.executeQuery("SELECT * FROM employees where  age > 25");
           while (rs.next()) {
               System.out.print("年龄大于25的名字: ");
               System.out.println(rs.getString(2));
           }
           rs.close();
           st.close();
       }
   }
   ```

   这里可以使用PreparedStatement。

   ```java
   PreparedStatement st = conn.prepareStatement("SELECT * FROM employees where  age > ?");
   st.setInt(1, 25);
   ```

   



# Why

1. 为什么`在java  1.6之前必须使用Class.forName("org.postgresql.Driver");或者java -Djdbc.drivers=org.postgresql.Driver example.ImageViewer来加载驱动，现在不需要了` ?是有一种新特性来加载驱动吗，加载驱动本质是什么？

2. PreparedStatement有什么好处

   防止SQL注入，通过设置st.setInt(1, xx);可以限定占位符的类型，但是我又产生疑问了，如果这样写会发生什么呢?

   ```java
   PreparedStatement st = conn.prepareStatement("SELECT * FROM employees where  age > ?");
   st.setString(1, "25 or 1=1");
   ```

   ```sql
   Exception in thread "main" org.postgresql.util.PSQLException: 错误: 操作符不存在: integer > character varying
     建议：没有匹配指定名称和参数类型的操作符. 您也许需要增加明确的类型转换.
   ```

   可以看出java层面会屏蔽sql注入的产生。

3. PreparedStatement提前编译是什么意思，怎么能看出来？

