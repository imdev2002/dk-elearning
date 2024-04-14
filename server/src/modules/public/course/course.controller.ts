import { Request, Response } from 'express';
import { BaseController } from '../../../abstractions/base.controller';
import passport from '../../../configs/passport';
import { CourseCategory, CourseStatus, ReqUser } from '../../../global';
import HttpException from '../../../exceptions/http-exception';
import NotFoundException from '../../../exceptions/not-found';
import xtripe from '../../../configs/xtripe';
import { CoursedPaidStatus } from '@prisma/client';

export default class PublicCourseController extends BaseController {
  public path = '/api/v1-public/courses';

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}/actions/buy`,
      passport.authenticate('jwt', { session: false }),
      this.buyAction,
    );
    this.router.post(
      `${this.path}/actions/heart`,
      passport.authenticate('jwt', { session: false }),
      this.heartAction,
    );
    this.router.post(
      `${this.path}/actions/comment`,
      passport.authenticate('jwt', { session: false }),
      this.createCommentAction,
    );
    this.router.patch(
      `${this.path}/actions/comment/:id`,
      passport.authenticate('jwt', { session: false }),
      this.updateCommentAction,
    );
    this.router.delete(
      `${this.path}/actions/comment/:id`,
      passport.authenticate('jwt', { session: false }),
      this.deleteCommentAction,
    );
    this.router.post(
      `${this.path}/actions/emoji`,
      passport.authenticate('jwt', { session: false }),
      this.emojiAction,
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.getCourses,
    );
    this.router.get(
      `${this.path}/:id`,
      passport.authenticate('jwt', { session: false }),
      this.getCourse,
    );
  }
  buyAction = async (req: Request, res: Response) => {
    try {
      const reqUser = req.user as ReqUser;
      const id = Number(req.body.courseId);
      const course = await this.prisma.course.findFirst({
        where: { id },
        include: { coursedPaid: true },
      });
      if (!course) {
        throw new NotFoundException('course', id);
      }
      if (!course.isPublic || course.status !== CourseStatus.APPROVED) {
        throw new HttpException(403, 'Forbidden');
      }

      const user = await this.prisma.user.findFirst({
        where: { id: reqUser.id },
        include: { coursedPaid: true },
      });
      if (!user) {
        throw new NotFoundException('user', reqUser.id);
      }

      for (const coursePaid of user.coursedPaid) {
        if (coursePaid.courseId === id) {
          throw new HttpException(400, 'You already bought this course');
        }
      }
      if (Number(course.priceAmount) === 0) {
        const _ = await this.prisma.coursedPaid.create({
          data: {
            user: { connect: { id: reqUser.id } },
            course: { connect: { id } },
            status: CoursedPaidStatus.SUCCESS,
          },
        });
        return res.status(200).json(_);
      }
      const checkout = await xtripe.checkout.sessions.create({
        line_items: [{ price: course.priceId as string, quantity: 1 }],
        mode: 'payment',
        expires_at: Date.now() + 1000 * 60 * 5,
        success_url: `${process.env.PUBLIC_URL}`,
      });
      return res.status(200).json(checkout);
    } catch (e: any) {
      console.log(e);
      return res
        .status(e.status || 500)
        .json({ status: e.status, message: e.message });
    }
  };
  heartAction = async (req: Request, res: Response) => {
    try {
      const id = Number(req.body.courseId);
      const reqUser = req.user as ReqUser;
      const course = await this.prisma.course.findFirst({
        where: { id },
      });
      if (!course) {
        throw new NotFoundException('course', id);
      }
      const heart = await this.prisma.heart.findFirst({
        where: { userId: reqUser.id, courseId: id },
      });

      if (heart) {
        await this.prisma.heart.delete({
          where: {
            id: heart.id,
          },
        });
        return res.status(200).json(heart);
      }
      const newHeart = await this.prisma.heart.create({
        data: {
          user: { connect: { id: reqUser.id } },
          course: { connect: { id } },
        },
      });

      return res.status(200).json(newHeart);
    } catch (e: any) {
      console.log(e);
      return res
        .status(e.status || 500)
        .json({ status: e.status, message: e.message });
    }
  };
  createCommentAction = async (req: Request, res: Response) => {
    try {
      const id = Number(req.body.courseId);
      const reqUser = req.user as ReqUser;
      const course = await this.prisma.course.findFirst({
        where: { id },
      });
      if (!course) {
        throw new NotFoundException('course', id);
      }
      const { content, level } = req.body;
      if (!content) {
        throw new HttpException(400, 'Where tf is your comment content');
      }
      let comment;
      if (level === 0) {
        comment = await this.prisma.comment.create({
          data: {
            content,
            user: { connect: { id: reqUser.id } },
            course: { connect: { id } },
            level: 0,
          },
        });
      } else if (level === 1 || level === 2) {
        const { parentId } = req.body;
        if (!(parentId || parentId == 0)) {
          throw new HttpException(400, 'parentId is missing');
        }
        comment = await this.prisma.comment.create({
          data: {
            content,
            user: { connect: { id: reqUser.id } },
            course: { connect: { id } },
            parent: { connect: { id: parentId } },
          },
        });
      } else {
        throw new HttpException(400, 'Invalid level');
      }
      return res.status(200).json(comment);
    } catch (e: any) {
      console.log(e);
      return res
        .status(e.status || 500)
        .json({ status: e.status, message: e.message });
    }
  };
  updateCommentAction = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const reqUser = req.user as ReqUser;
      const comment = await this.prisma.comment.findFirst({ where: { id } });
      if (!comment) {
        throw new NotFoundException('comment', id);
      }
      if (comment.userId !== reqUser.id) {
        throw new HttpException(401, 'Unauthorized');
      }
      const { content } = req.body;
      await this.prisma.comment.update({ where: { id }, data: { content } });
      const newComment = await this.prisma.comment.findFirst({ where: { id } });
      return res.status(200).json(newComment);
    } catch (e: any) {
      console.log(e);
      return res
        .status(e.status || 500)
        .json({ status: e.status, message: e.message });
    }
  };
  deleteCommentAction = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const reqUser = req.user as ReqUser;
      const comment = await this.prisma.comment.findFirst({
        where: { id },
        include: { children: { include: { children: true } } },
      });
      if (!comment) {
        throw new NotFoundException('comment', id);
      }
      if (comment.userId !== reqUser.id) {
        throw new HttpException(401, 'Unauthorized');
      }
      if (comment.level === 0) {
        const comments = await this.prisma.comment.findMany({
          where: { parentId: id },
        });
        for (const comment of comments) {
          await this.prisma.comment.deleteMany({
            where: { parentId: comment.id },
          });
          await this.prisma.comment.delete({ where: { id: comment.id } });
        }
        await this.prisma.comment.delete({ where: { id } });
      } else if (comment.level === 1) {
        await this.prisma.comment.deleteMany({
          where: { parentId: id },
        });
        await this.prisma.comment.delete({
          where: { id },
        });
      } else if (comment.level === 2) {
        await this.prisma.comment.delete({
          where: { id },
        });
      }
      return res.status(200).json(comment);
    } catch (e: any) {
      console.log(e);
      return res
        .status(e.status || 500)
        .json({ status: e.status, message: e.message });
    }
  };
  emojiAction = async (req: Request, res: Response) => {
    try {
      const id = Number(req.body.courseId);
      const reqUser = req.user as ReqUser;
      const course = await this.prisma.course.findFirst({
        where: { id },
      });
      if (!course) {
        throw new NotFoundException('course', id);
      }
      const { emojiIconId } = req.body;
      const emojiIcon = await this.prisma.emojiIcon.findFirst({
        where: { id: emojiIconId },
      });
      if (!emojiIcon) {
        throw new NotFoundException('emoji icon', emojiIconId);
      }
      const emoji = await this.prisma.emoji.findFirst({
        where: {
          emojiId: emojiIconId,
          userId: reqUser.id,
          courseId: id,
        },
      });
      if (emoji) {
        await this.prisma.emoji.delete({
          where: {
            id: emoji.id,
          },
        });
        return res.status(200).json(emoji);
      }
      const newEmoji = await this.prisma.emoji.create({
        data: {
          emoji: { connect: { id: emojiIconId } },
          user: { connect: { id: reqUser.id } },
          course: { connect: { id } },
        },
      });

      return res.status(200).json(newEmoji);
    } catch (e: any) {
      console.log(e);
      return res
        .status(e.status || 500)
        .json({ status: e.status, message: e.message });
    }
  };
  getCourses = async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 12;
      const offset = Number(req.query.offset) || 0;
      const search = req.query.search as string;
      const category = req.query.category as CourseCategory[];
      const orderBy = (req.query.orderBy as string) || 'timestamp';
      const direction = (req.query.direction as 'asc' | 'desc') || 'desc';
      const query: any = {
        where: {
          isPublic: true,
          status: CourseStatus.APPROVED,
        },
        take: limit,
        skip: offset,

        orderBy: [
          {
            [orderBy]: direction,
          },
        ],
      };
      if (category.length > 0) {
        query.where.category = {
          in: category,
        };
      }
      if (search) {
        query.where.OR = [
          {
            title: {
              contains: search,
            },
          },
          {
            descriptionMD: {
              contains: search,
            },
          },
          {
            user: { firstName: { contains: search } },
          },
          {
            user: { lastName: { contains: search } },
          },
        ];
      }
      const courses = await this.prisma.course.findMany({
        ...query,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          coursedPaid: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          hearts: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          emojis: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          certificates: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          parts: true,
          lessons: {
            include: {
              comments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
              hearts: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
              emojis: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return res.status(200).json(courses);
    } catch (e: any) {
      console.log(e);
      return res
        .status(e.status || 500)
        .json({ status: e.status, message: e.message });
    }
  };
  getCourse = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const course = await this.prisma.course.findFirst({
        where: { id, isPublic: true, status: CourseStatus.APPROVED },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          coursedPaid: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          hearts: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          emojis: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          certificates: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          parts: true,
          lessons: {
            include: {
              comments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
              hearts: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
              emojis: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!course) {
        throw new NotFoundException('course', id);
      }
      return res.status(200).json(course);
    } catch (e: any) {
      console.log(e);
      return res
        .status(e.status || 500)
        .json({ status: e.status, message: e.message });
    }
  };
}