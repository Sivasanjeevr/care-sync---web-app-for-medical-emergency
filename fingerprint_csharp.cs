using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MANTRA;
using MongoDB.Bson;
using MongoDB.Driver;
using System.IO;
using Neurotec.Biometrics;
using Neurotec.Devices;
using Neurotec.Biometrics.Client;
using Neurotec.Biometrics.Standards;
using Neurotec.Images;
using System.Security.Cryptography;

namespace finger_project
{
    internal class Program
    {
        //private static object matchingSubject;
        //private static object fingerprintData;

        static void Main(string[] args)
        {
            MFS100 mfs100 = new MFS100();
            int ret = mfs100.Init();
            if (ret != 0)
            {
                Console.WriteLine(mfs100.GetErrorMsg(ret), true);
            }
            else
            {
                Console.WriteLine("Device initialized successfully");
            }
            string datapath = AppDomain.CurrentDomain.BaseDirectory;
            var client = new MongoClient("mongodb://localhost:27017");
            var database = client.GetDatabase("ihealth");
            var collection = database.GetCollection<BsonDocument>("users");
            FingerData fingerprintdata2 = null;
            int ret2 = mfs100.AutoCapture(ref fingerprintdata2, 30000000, true, true);
            while (ret2 != 0)
            {
                // Console.WriteLine("Place again");
                ret2 = mfs100.AutoCapture(ref fingerprintdata2, 300000000, true, true);
            }
            System.IO.File.WriteAllBytes(datapath + "//ISOTemplate2.iso", fingerprintdata2.ISOTemplate);
            byte[] template2 = System.IO.File.ReadAllBytes(datapath + "//ISOTemplate2.iso");
            int sid = 1,flag=1,score=0;
            while (sid <= 7)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("sid", sid);
                var document = collection.Find(filter).FirstOrDefault();
                byte[] template1 = document["ISOTemplate"].AsByteArray;
                /*FingerData fingerprintdata1 = null;
                int ret1 = mfs100.AutoCapture(ref fingerprintdata1, 300000000, true, true);
                if (ret1 == 0)
                {
                    var fingerprintBuffer = new BsonBinaryData(fingerprintdata1.ISOTemplate);
                    var filter = Builders<BsonDocument>.Filter.Eq("username", "Manoj");
                    var update = Builders<BsonDocument>.Update.Set("ISOTemplate", fingerprintBuffer);
                    var result = await collection.UpdateOneAsync(filter, update);
                    System.IO.File.WriteAllBytes(datapath + "//ISOTemplate1.iso", fingerprintdata1.ISOTemplate);
                }
                else
                {
                    Console.WriteLine("Error!!!");
                }*/
                //byte[] template1 = System.IO.File.ReadAllBytes(datapath + "//ISOTemplate1.iso");
                
                if (ret2 == 0)
                {

                    int ret3 = mfs100.MatchISO(template1, template2, ref score);
                    if (ret3 == 0)
                    {

                        if (score >= 1400)
                        {
                            flag = 0;
                            var username = document.GetValue("username").AsString;
                            Console.WriteLine($"{username}");
                        }
                    }
                }
                sid += 1;
            }
            if (flag == 1)
            {
                Console.WriteLine("No match found!!");
            }
            Console.ReadKey();
            //NSubject subject = new NSubject();

            /*string version = mfs100.GetSDKVersion();
            Console.WriteLine("SDK Version: " + version, false);
            if (mfs100.IsConnected())
            {
                Console.WriteLine("Device Connected", false);
            }
            else
            {
                Console.WriteLine("Device not connected", true);
            }
            DeviceInfo deviceInfo = null;

            int ret = mfs100.Init();
            if( ret !=0)
            {
                Console.WriteLine(mfs100.GetErrorMsg(ret), true);
            }
            else
            {
                Console.WriteLine("Device initialized successfully");
            }


                deviceInfo = mfs100.GetDeviceInfo();
                if(deviceInfo != null)
                {
                    string scannerInfo = "SERIAL NO.: " + deviceInfo.SerialNo + " MAKE: " + deviceInfo.Make + "MODEL: " + deviceInfo.Model;
                Console.WriteLine(scannerInfo);
                    //lblSerial.Text = scannerInfo;
                }
                else
                {
                    //lblSerial.Text = "";
                }
                //Console.WriteLine(mfs100.GetErrorMsg(ret), false);
            FingerData fingerprintdata1 = null;
            int ret1 = mfs100.AutoCapture(ref fingerprintdata1, 300000000, true, true);

            while (ret1 != 0)
            {
               // Console.WriteLine("Place again");
                ret1 = mfs100.AutoCapture(ref fingerprintdata1, 300000000, true, true);
            }
            System.IO.File.WriteAllBytes(datapath + "//ISOTemplate2.iso", fingerprintdata1.ISOTemplate);
            byte[] template2 = System.IO.File.ReadAllBytes(datapath + "//ISOTemplate2.iso");
            int sid = 1;
           int flag = 0;
            while (sid <= 4)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("sid", sid);
                var document = collection.Find(filter).FirstOrDefault();
                byte[] template1 = document["ISOTemplate"].AsByteArray;

                int score = 0;
                int ret2 = mfs100.MatchISO(template1, template2, ref score);
                if (ret2 == 0)
                {

                   if (score >= 1400)
                   {
                       flag = 1;
                       var email = document.GetValue("email").AsString;
                       var username = document.GetValue("username").AsString;
                       var dob = document.GetValue("dob").AsString;
                       var patient_id = document.GetValue("patient_id").AsString;
                       var phone_number = document.GetValue("phone_number").AsString;
                       var age = document.GetValue("age").AsString;
                       var gender = document.GetValue("gender").AsString;
                       var blood_grp = document.GetValue("blood_grp").AsString;
                       var nominee_name = document.GetValue("nominee_name").AsString;
                       var nominee_relation = document.GetValue("nominee_relation").AsString;
                       var nominee_number = document.GetValue("nominee_number").AsString;
                       var address = document.GetValue("address").AsString;
                       var bp = document.GetValue("bp").AsString;
                       var sugar = document.GetValue("sugar").AsString;
                       var heart_rate = document.GetValue("heart_rate").AsString;
                       var glucose = document.GetValue("glucose").AsString;
                       var temp = document.GetValue("temp").AsString;
                       //Console.WriteLine($"{username}");
                        Console.WriteLine("succefully Finger matched with score: " + score.ToString(), false);
                        Console.WriteLine($"Personal information:\n your email: {email}");
                        Console.WriteLine($"your username: {username}\nyour dob: {dob}\nyour patient_id: {patient_id}\nyour ph num: {phone_number}\nyour age: {age}\nyour gender:{gender}\nyour blood group: {blood_grp}\nyour nominee name:{nominee_name}\nyour nominee relation: {nominee_relation}\nyour nominee number:{nominee_number}\nyour address: {address}\nyour blood pressure: {bp}\nyour sugar level : {sugar}\nyour heart rate: {heart_rate}\nyour glucose level: {glucose}\nyour temparature:{temp}");
                    }
                    sid += 1;
                }
               if (flag == 0)
               {
                   Console.WriteLine("your finger print is not present in any database");
               }
               Console.ReadKey();
            } 
           */
        }
    }
}
/*string input = Console.ReadLine();
            int ch1 = int.Parse(input);
            if (ch1 == 1)
            {
                FingerData fingerprintData1 = null;

                int ret1 = mfs100.AutoCapture(ref fingerprintData1, 30000, true, true);
                if (ret1 == 0)
                {

                }
            }*/
/*// Extract ISO template from captured fingerprint
var isoTemplate = new NTemplate(fingerprintData1.ISOTemplate);

// Convert ISO template to byte array
var templateBuffer = isoTemplate.Save().ToArray();

// Search for matching template in MongoDB
var filter = Builders<BsonDocument>.Filter.Eq("ISOTemplate", new BsonBinaryData(templateBuffer));
var document = collection.Find(filter).FirstOrDefault();

if (document != null)
{
    // Retrieve username from MongoDB document
    var username = document.GetValue("username").AsString;

    // Print username
    Console.WriteLine($"Username: {username}");
}
else
{
    Console.WriteLine("No matching document found in the database.");
}
}
else
{
Console.WriteLine("Capture failed.");
}
if (ret1 != 0)
{

Console.WriteLine(mfs100.GetErrorMsg(ret1), true);
}
else
{
var biometricClient = new NBiometricClient();
var subject = new NSubject();
var finger = new NFinger { Position = NFPosition.Unknown };
finger.Image = NImage.FromMemory(fingerprintData1.ISOTemplate);
subject.Fingers.Add(finger);
biometricClient.CreateTemplate(subject);
var templateBuffer = subject.GetTemplateBuffer().ToArray();
// Search for matching template in MongoDB
var filter = Builders<BsonDocument>.Filter.Eq("ISOTemplate", new BsonBinaryData(templateBuffer));
var document = collection.Find(filter).FirstOrDefault();

if (document != null)
{
    // Retrieve username from MongoDB document
    var username = document.GetValue("username").AsString;

    // Print username
    Console.WriteLine($"Username: {username}");
}
else
{
    Console.WriteLine("No matching document found in the database.");
}
//Console.WriteLine("Captured success");

System.IO.File.WriteAllBytes(datapath + "//ISOTemplate1.iso", fingerprintData1.ISOTemplate);
}
}
System.IO.File.ReadAllBytes(datapath + "//ISOTemplate1.iso");
}*/
/*var template = new NTemplate(template1);
var subject1 = new NSubject();
subject1.SetTemplate(template);

var biometricClient = new NBiometricClient();
biometricClient.MatchingThreshold = 48;

var identifyTask = biometricClient.CreateTask(NBiometricOperations.Identify, null);
identifyTask.Subjects.Add(subject);
biometricClient.PerformTask(identifyTask);

var results = identifyTask.Subjects[0].MatchingResults;
var username = results["username"].AsString;
*/
/*byte[] Template = File.ReadAllBytes("ISOTemplate1.iso");
var filter = Builders<BsonDocument>.Filter.Eq("ISOTemplate", new BsonBinaryData(Template));
var result = collection.Find(filter).FirstOrDefault();
if (result != null)
{
    // document found, do something with it
    Console.WriteLine("Matching document found: " + result.ToString());
}
else
{
    Console.WriteLine("No matching document found.");
}*/



/*Console.WriteLine("please enter 1 and place your second finger");
string input2 = Console.ReadLine();
int ch2 = int.Parse(input2);
if (ch2 == 1)
{
    FingerData fingerprintData2 = null;
    int ret2 = mfs100.AutoCapture(ref fingerprintData2, 30000, true, true);
    if (ret2 != 0)
    {

        Console.WriteLine(mfs100.GetErrorMsg(ret2), true);
    }
    else
    {
        Console.WriteLine("Captured success");
        System.IO.File.WriteAllBytes(datapath + "//ISOTemplate2.iso", fingerprintData2.ISOTemplate);
    }
}
if (ch1 == 1 && ch2 == 1)
{
    int score = 0;
    byte[] template1 = System.IO.File.ReadAllBytes(datapath + "//ISOTemplate1.iso");
    byte[] template2 = System.IO.File.ReadAllBytes(datapath + "//ISOTemplate2.iso");
    int ret3 = mfs100.MatchISO(template1, template2, ref score);
    if (ret3 == 0)
    {
        if (score >= 1400)
        {
            Console.WriteLine("Finger matched with score: " + score.ToString());
        }
        else
        {
            Console.WriteLine("Finger not matched, score: " + score.ToString() + " is too low");
        }
    }
    else
    {
        Console.WriteLine(mfs100.GetErrorMsg(ret3), true);
    }
}
else
{
    Console.WriteLine("Invalid input you gave!!!");
}*/
