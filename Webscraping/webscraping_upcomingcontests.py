import requests, sys, os, re, operator, math, csv, json, base64
from lxml import html
from pymongo import MongoClient
#In order to run this file, make sure to install the libxml2, lxml, pymongo, and requests packages.

#HLTV page info
page_url = 'http://www.hltv.org/events/upcoming/'
upcomingContestsPage = requests.get(page_url)
content = html.fromstring(upcomingContestsPage.content)

#Database info
client = MongoClient('mongodb://fantasy-esports:jajajoos@ds157479.mlab.com:57479/fantasy-esports')
db = client['fantasy-esports']
contestCollection = db.contests

contest = {}
'''contestNames = []
eventTypes = [] #Online or LAN
startDates = []
endDates = []
locations = []
prizePots = []
teamCount = []
player_ids = []'''


def get_contest_info(pathToContest, i, j):
        #Fetch all of the relevant information from the page
        contestName =  content.xpath(pathToContest + "/div[1]/div/a/text()")
        if (len(contestName) is 0):
               return;
        contestLink = content.xpath(pathToContest + "/div[1]/div/a/@href")
        if (j != -1):
                eventType = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[" + str(i) + "]/div[" + str(j) + "]/div/div[1]/div/text()")
        else:
                eventType = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div/div[" + str(i) + "]/div/div[1]/div/text()")
        
        startDate = content.xpath(pathToContest + "/div[2]/div[2]/text()")
        
        #EndOrNot checks whether or not this is a 1 day contest.
        endOrNot = content.xpath(pathToContest + "/div[3]/div[1]/text()")
        if (endOrNot[0] == 'End:'):
               endDate =  content.xpath(pathToContest + "/div[3]/div[2]/text()")
               if endDate[0] == 'TBD':
                        return;
               location = content.xpath(pathToContest + "/div[4]/span/text()")
               prizePot = content.xpath(pathToContest + "/div[5]/span/text()")
               teams = content.xpath(pathToContest + "/div[7]/span/text()")
        else:
                endDate = startDate;
                location = content.xpath(pathToContest + "/div[3]/span/text()")
                if (location[0] == ' '):
                        location[0] = 'Online'
                prizePot = content.xpath(pathToContest + "/div[4]/span/text()")
                teams = content.xpath(pathToContest + "/div[6]/span/text()")
        if len(teams) == 0 or teams[0] == 'TBA':
                return;
        
        contestPage = requests.get("http://www.hltv.org/" + contestLink[0])
        contestContent = html.fromstring(contestPage.content)
        playerList = []
        #
        for i in range(1, int(teams[0])+1):       #Goes through all of the teams for the tournament
                for j in range (2, 8):  #gets all of the players for the team
                        teamMemberLink = contestContent.xpath("//*[@id='back']/div[3]/div[3]/div/div[11]/div[2]/div/div[" + str(i) + "]/div/div[2]/div[" + str(j) + "]/a/@href")
                        if len(teamMemberLink) > 0:
                                if (teamMemberLink[0])[1:2] == '?':
                                        teamMemberID = (teamMemberLink[0])[22:len(teamMemberLink[0])]
                                else:
                                        teamMemberID = (teamMemberLink[0])[8:(teamMemberLink[0].index('-'))]
                                playerList.append({"id": teamMemberID, "points": 0})
        if len(playerList) < int(teams[0]) * 3 or int(teams[0]) == 0:     #5 players per team. 4 in case some are randomly missing
                return;
        print(contestName[0])
        '''contestNames.append(contestName[0])
        eventTypes.append(eventType[0])
        startDates.append(startDate[0])
        endDates.append(endDate[0])
        locations.append(location[0].strip())
        if len(prizePot) > 0:
                prizePots.append(prizePot[0])
        else:
                prizePots.append('-')
        teamCount.append(teams[0])
        player_ids.append(playerList)'''
        
        modifiedStartDate = modifyDateFormat(startDate[0].strip())
        modifiedEndDate = modifyDateFormat(endDate[0].strip())
        
        idString = contestName[0] + str(i) + str(j)
        contestID = idString.replace(" ", "")
        
        encodedID = base64.b64encode(contestID)
        shortenedID = encodedID[len(encodedID)/2:len(encodedID)]
        
        contest = {
        "_id": encodedID,
        "name": contestName[0],
        "startDate": modifiedStartDate,
        "endDate": modifiedEndDate,
        "maxSalary": 30000,
        "players": playerList,
        "entries": {
                "numMax": 1000,
                "user_ids": [],
                "numCurrent": 0
        },
        "__v": 0
        }
        contestDict = contestCollection.find_one({"name": contestName[0]})
        if contestDict == None: #This contest doesn't exist in the database yet!
                contestCollection.insert_one(contest)
                print('insertedContest')
        else:   #The contest exists, check to see if there are more players attending now.
                #Use this to update a specific feature.
                '''db.contests.update_one({
                        'name': contestDict['name']
                },{
                        '$set': {
                                '_id': shortenedID
                        }
                }, upsert=False)'''
                oldPlayerList = contestDict['players']
                if len(oldPlayerList) < len(playerList):        #Update the list to include all of the new players
                        db.contests.update_one({
                                'name': contestDict['name']
                        },{
                                '$set': {
                                        'players': playerList
                                }
                        }, upsert=False)
                        print('updated player list')
                
                else:
                        print('NOT updated player list')

def modifyDateFormat(dateString):
        modfiedDate = ""
        
        day = dateString[0:2]
        
        if (not day.isdigit()):
               day = "0" + dateString[0:1]
        
        if (dateString.find("January") != -1):
                month = "01"
        elif (dateString.find("February") != -1):
                month = "02"
        elif (dateString.find("March") != -1):
                month = "03"
        elif (dateString.find("April") != -1):
                month = "04"
        elif (dateString.find("May") != -1):
                month = "05"
        elif (dateString.find("June") != -1):
                month = "06"
        elif (dateString.find("July") != -1):
                month = "07"
        elif (dateString.find("August") != -1):
                month = "08"
        elif (dateString.find("September") != -1):
                month = "09"
        elif (dateString.find("October") != -1):
                month = "10"
        elif (dateString.find("November") != -1):
                month = "11"
        elif (dateString.find("December") != -1):
                month = "12"
        else:
                month = "??"
        
        year = dateString[len(dateString)-4:len(dateString)]
        
        modifiedDate = "" + month + "/" + day + "/" + year
        
        return modifiedDate
        


for i in range (1, 7): #Controls the number of months to look ahead.
        for j in range (1, 20):  #controls the number of possible tournaments to look for in a month.
                get_contest_info("//*[@id='back']/div[3]/div[3]/div/div[2]/div[" + str(i) + "]/div[" + str(j) + "]/div/div[2]", i, j)

print('Finished Upcoming')
page_url = 'http://www.hltv.org/events/ongoing/'
upcomingContestsPage = requests.get(page_url)
content = html.fromstring(upcomingContestsPage.content)
print('\nONGOING:')

for i in range (1, 25):
        get_contest_info("//*[@id='back']/div[3]/div[3]/div/div[2]/div/div[" + str(i) + "]/div/div[2]/", i, -1)

print("data retrieved")

#Note for Mac users (myself):
#Do 'brew services start mongodb' if database isn't working!